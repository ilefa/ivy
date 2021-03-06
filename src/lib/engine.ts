/*
 * Copyright (c) 2021 ILEFA Labs
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Logger } from './logger';
import { spawn } from 'child_process';
import { StartupRunnable } from './startup';
import { codeBlock, EmbedBuilder, isSnowflake, join } from './util';
import { DefaultGuildDataProvider, GuildDataProvider, GuildTokenLike } from './data';

import {
    Channel,
    Client,
    ClientOptions,
    ColorResolvable,
    Guild,
    Intents,
    Message,
    MessageEmbed,
    PermissionResolvable,
    PresenceData,
    TextChannel,
    User
} from 'discord.js';

import {
    Command,
    CommandManager,
    DefaultEventManager,
    EventManager,
    GenericTestCommand,
    Module,
    ModuleManager,
    TestCommand
} from './module';

export type IvyEngineOptions = {
    token: string;
    name: string;
    logger: Logger;
    gitRepo?: string;
    superPerms: string[];
    reportErrors: string[];
    color: ColorResolvable;
    prefix?: string;
    provider?: GuildDataProvider<GuildTokenLike>;
    commandMessages?: IvyCommandMessages;
    startup?: StartupRunnable;
    eventHandler?: EventManager;
    presence?: PresenceData;
    discord?: ClientOptions;
}

export type IvyCommandMessages = {
    permission: (user: User, message: Message, command: Command) => MessageEmbed;
    commandError: (user: User, message: Message, name: string, args: string[]) => MessageEmbed;
    commandErrorVerbose: (user: User, message: Message, name: string, args: string[], error: Error) => MessageEmbed;
}

export enum IvyEmbedIcons {
    AUDIO = 'https://storage.googleapis.com/stonks-cdn/audio.png',
    BIRTHDAY = 'https://storage.googleapis.com/stonks-cdn/birthday.png',
    EDU = 'https://storage.googleapis.com/stonks-cdn/univ.png',
    ERROR = 'https://storage.googleapis.com/stonks-cdn/error.png',
    HELP = 'https://storage.googleapis.com/stonks-cdn/help.png',
    MEMBER = 'https://storage.googleapis.com/stonks-cdn/member.png',
    MESSAGE = 'https://storage.googleapis.com/stonks-cdn/message.png',
    NUMBERS = 'https://storage.googleapis.com/stonks-cdn/numbers.png',
    POLL = 'https://storage.googleapis.com/stonks-cdn/poll.png',
    PREFS = 'https://storage.googleapis.com/stonks-cdn/prefs.png',
    STONKS = 'https://storage.googleapis.com/stonks-cdn/stonks.png',
    TEST = 'https://storage.googleapis.com/stonks-cdn/test.png',
    XP = 'https://storage.googleapis.com/stonks-cdn/xp.png'
}

export abstract class IvyEngine {

    start: number;
    client: Client;
    logger: Logger;
    icons: IvyEmbedIcons;
    embeds: EmbedBuilder;
    moduleManager: ModuleManager;
    commandManager: CommandManager;
    provider: GuildDataProvider<GuildTokenLike>;

    private HASH_PATTERN = /\b[0-9a-f]{5,40}\b/;
    private GIT_REPO_PATTERN = /\w+\/\w+/;
    private vcsEnabled: boolean;

    constructor(public opts: IvyEngineOptions) {
        this.start = Date.now();
        this.logger = opts.logger;
        this.vcsEnabled = !!opts.gitRepo;
        if (this.vcsEnabled && !this.GIT_REPO_PATTERN.test(this.opts.gitRepo)) {
            this.vcsEnabled = false;
        }

        this.opts.startup?.run(this);
        this.client = new Client(opts.discord || {
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_BANS,
                Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
                Intents.FLAGS.GUILD_INTEGRATIONS,
                Intents.FLAGS.GUILD_MEMBERS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
                Intents.FLAGS.GUILD_VOICE_STATES,
                Intents.FLAGS.GUILD_WEBHOOKS],
            partials: ['CHANNEL', 'MESSAGE', 'REACTION']
        });

        this.validatePrefs();

        this.provider = this.opts.provider;
        this.embeds = new EmbedBuilder(this);
        this.moduleManager = new ModuleManager(this);
        this.commandManager = new CommandManager(this);
        
        this.registerCommands();
        this.registerFlows();
        this.registerModules();

        this.moduleManager.registerModule(opts.eventHandler || new DefaultEventManager(this));
        this.moduleManager.registerModule(this.commandManager);
        this.moduleManager.init();
        
        this.client.login(opts.token);
        this.client.on('ready', async () => {
            if (this.vcsEnabled) {
                this.logger.info(opts.name, `Release channel: ${await this.getReleaseChannel()}, version: ${await this.getCurrentVersion()}`);
            }

            this.logger.info(opts.name, 'Successfully connected to Discord.');
            this.client.user.setPresence(opts.presence || {
                status: 'online',
                activities: [{
                    type: 'PLAYING',
                    name: 'with the ivy platform.'
                }]
            });

            this.onReady(this.client);
        });
    }

    abstract registerCommands(): void;
    abstract registerModules(): void;
    abstract registerFlows(): void;
    abstract onReady(client: Client): void;

    private validatePrefs = () => {
        let { logger, opts } = this;
        if (opts.superPerms.some(id => !isSnowflake(id)))
            logger.warn(opts.name, `Non-Snowflake entries in superPerms array: [${join(opts.superPerms.filter(id => !isSnowflake(id)), ', ', _ => _)}]`);

        if (opts.reportErrors.some(id => !isSnowflake(id)))
            logger.warn(opts.name, `Non-Snowflake entries in reportErrors array: [${join(opts.reportErrors.filter(id => !isSnowflake(id)), ', ', _ => _)}]`);

        if (this.opts.provider && this.opts.prefix) {
            logger.severe(opts.name, 'Ambigious data provider options detected.');
            logger.severe(opts.name, ' - Either supply a data provider or a prefix, not both.');
            return process.exit(0);
        }
        
        if (!this.opts.provider && !this.opts.prefix) {
            logger.severe(opts.name, 'Cannot initialize DefaultGuildDataProvider without a prefix parameter.');
            logger.severe(opts.name, ' - Either explicitly supply a data provider, or supply a prefix for use with the default provider.');
            return process.exit(0);
        }

        if (!this.opts.provider && this.opts.prefix)
            this.opts.provider = new DefaultGuildDataProvider(opts.prefix);

        if (!this.opts.commandMessages)
            this.opts.commandMessages = {
                permission: (_user, _message, _command) => this.embeds.build('Whoops', IvyEmbedIcons.ERROR, `You don't have permission to do this.`),
                commandError: (_user, message, _name, _args) => this.embeds.build('Huh? That wasn\'t supposed to happen..', IvyEmbedIcons.ERROR, 'Something went wrong while processing your command.', [], message),
                commandErrorVerbose: (_user, message, name, args, error) => this.embeds.build('Huh? That wasn\'t supposed to happen..', IvyEmbedIcons.ERROR, `Something went wrong while processing your command.`, [
                    {
                        name: 'Command',
                        value: codeBlock('', name),
                        inline: true
                    },
                    {
                        name: 'Arguments',
                        value: codeBlock('json', JSON.stringify(args)),
                        inline: true
                    },
                    {
                        name: 'Error',
                        value: codeBlock('', error.message),
                        inline: false
                    },
                    {
                        name: 'Stacktrace',
                        value: codeBlock('', error.stack),
                        inline: false
                    }
                ], message)
            }
    }

    /**
     * Registers a command.
     * 
     * @param name the name of the command
     * @param command the command instance
     */
    registerCommand = (command: Command) => this.commandManager.registerCommand(command);

    /**
     * Registers a module.
     * @param module the module instance
     */
    registerModule = (module: Module) => {
        try {
            this.moduleManager.registerModule(module);
        } catch (e) {
            this.logger.severe(this.opts.name, 'Encountered an error while registering a module:');
            this.logger.unlisted(e.stack);
        }
    }

    /**
     * Unregisters a module.
     * @param module the module instance
     */
    unregisterModule = (module: Module) => {
        try {
            this.moduleManager.unregisterModule(module);
        } catch (e) {
            this.logger.severe(this.opts.name, 'Encountered an error while unregistering a module:')
            this.logger.unlisted(e.stack);
        }
    }

    /**
     * Registers a flow.
     * @param flow the flow to register
     */
    registerFlow = (flow: TestCommand) => this.commandManager.registerTestFlow(flow);

    /**
     * Registers a managed flow.
     * 
     * @param flow the managed flow to register
     * @param module the manager for this flow
     */
    registerManagedFlow = <T extends Module>(flow: GenericTestCommand<T>, module: T) => this.commandManager.registerGenericTestFlow(flow, module);

    /**
     * Registers a custom event handler.
     * @param manager the event manager to register
     */
    registerEventHandler = <T extends EventManager>(manager: T) => {
        let handler = this.opts.eventHandler;
        let registered = this.moduleManager.require<EventManager>('Events');
        if (!handler && (registered && registered instanceof DefaultEventManager)) {
            this.unregisterModule(registered);
        }

        this.registerModule(manager);
        this.opts.eventHandler = manager;
    }

    /**
     * Returns whether or not a given user has
     * a certain bot permission in a given guild.
     * 
     * Note: This does not necessarily mean that
     * the user has that permission in the guild
     * (in the case of SuperPerms users always being true).
     * 
     * @param user the user in question
     * @param permission the permission in question
     * @param guild the guild in which this takes place
     */
    has = (user: User, permission: PermissionResolvable | 'SUPER_PERMS', guild: Guild) => {
        let isSuper = this.opts.superPerms.includes(user.id);
        if (permission === 'SUPER_PERMS')
            return isSuper;

        return isSuper || guild
            .members
            .cache
            .get(user.id)
            .permissions
            .has(permission);
    }

    /**
     * Attempts to find a guild using the Discord.js
     * instance cache, and if not found, queries the
     * Discord API.
     * 
     * @param id the id of the guild
     */
    findGuild = async (id: string) => {
        return await this
            .client
            .guilds
            .fetch(id)
            .catch(_ => null);
    }

    /**
     * Attempts to find a user using the Discord.js
     * instance cache, and if not found, queries the
     * Discord API.
     * 
     * @param id the id of the user
     */
    findUser = async (id: string) => {
        return await this
            .client
            .users
            .fetch(id)
            .catch(_ => null);
    }

    /**
     * Attempts to find a channel (of type T) using the
     * Discord.js instance cache, and if not found,
     * queries the Discord API.
     * 
     * @param id the id of the channel
     */
    findChannel = async <T extends Channel = TextChannel>(id: string) => {
        return await this
            .client
            .channels
            .fetch(id)
            .catch(_ => null) as T;
    }

    /**
     * Spawns a shell and runs git command.
     * @param args args to pass to <git ...>
     */
    private execGit = (args: string): Promise<string> => new Promise((res, rej) => {
        const srv = spawn('git', args.split(' '));
        const out = {
            stdout: [],
            stderr: []
        }

        srv.stdout.on('data', data => out.stdout.push(data.toString()));
        srv.stderr.on('data', data => out.stderr.push(data.toString()));
        srv.on('exit', code => {
            if (code !== 0) {
                return rej(out.stderr.join('').trim());
            }

            res(out
                .stdout
                .join('')
                .trim());
        })
    });

    /**
     * Returns the current git version of this project.
     */
    getCurrentVersion = async () => {
        if (!this.vcsEnabled)
            return 'unknown';

        let res = await this.execGit('rev-parse HEAD').catch(err => null);
        if (!this.HASH_PATTERN.test(res))
            return 'unknown';

        return res.substring(0, 7);
    };

    /**
     * Returns the current upstream git version of this project.
     */
    getUpstreamVersion = async () => {
        if (!this.vcsEnabled)
            return 'unknown';

        let cmd = `ls-remote git@github.com:${this.opts.gitRepo}.git | grep refs/heads/${await this.getReleaseChannel()} | cut -f 1`;
        let res = await this
            .execGit(cmd)
            .catch(_ => null);

        if (!res)
            return 'unknown';

        return res.substring(0, 7);
    }

    /**
     * Returns the current "release channel" aka branch of this local build.
     */
    getReleaseChannel = async () => {
        if (!this.vcsEnabled)
            return 'unknown';

        let res = await this
            .execGit('rev-parse --abbrev-ref HEAD')
            .catch(_ => null);

        if (!res || res.startsWith('fatal'))
            return 'unknown';

        return res;
    };

    /**
     * Attempts to pull the latest version of this project from the git repository.
     * @param then what to do with the new version, or "Failure" if it doesn't succeed.
     */
    update = async (then?: (version: String) => void) => {
        if (!this.vcsEnabled)
            return then('Failure');

        let local = await this.getCurrentVersion();
        let remote = await this.getUpstreamVersion();
        if (local.toLowerCase() === remote.toLowerCase())
            return then(local);

        let res = await this.execGit('git pull');
        if (!res) return then('Failure');
        return then(await this.getCurrentVersion());
    }

}