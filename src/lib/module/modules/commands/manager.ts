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

import { Module } from '../../module';
import { User, Message, Client } from 'discord.js';
import { IvyEmbedIcons, IvyEngine } from '../../../engine';
import { conforms, numberEnding, SNOWFLAKE_REGEX } from '../../../util';

import {
    Command,
    CommandEntry,
    CommandReturn,
    GenericTestCommand,
    TestCommand,
    TestCommandEntry
} from '.';

export class CommandManager extends Module {
    
    client: Client;
    commands: CommandEntry[];
    testFlows: TestCommandEntry[];
    
    constructor(public engine: IvyEngine) {
        super('Commands');
        this.client = engine.client;
        this.commands = [];
        this.testFlows = [];
    }

    /**
     * Registers a command with the given parameters.
     * 
     * @param name the name of the command
     * @param command the command class
     */
    registerCommand(command: Command) {
        command.manager = this;
        command.start();
        this.commands.push({
            name: command.name,
            command
        });
    }

    /**
     * Registers a test flow with the given parameters.
     * 
     * @param command the command class
     */
    registerTestFlow(flow: TestCommand) {
        flow.manager = this;
        flow.start();

        this.testFlows.push({
            name: flow.name,
            command: flow
        });
    }

    /**
     * Registers a generic test flow with the given parameters.
     * 
     * @param command the command class
     */
    registerGenericTestFlow<M extends Module>(flow: GenericTestCommand<M>, module: M) {
        flow.manager = this;
        flow.module = module;
        flow.start();
        
        this.testFlows.push({
            name: flow.name,
            command: flow
        });
    }

    start() {
        this.commands = this.commands.sort((a, b) => a.name.localeCompare(b.name));
        this.engine.logger.info(this.name, `Registered ${this.commands.length} command${numberEnding(this.commands.length)}.`);
    }

    end = () => this.commands = [];

    /**
     * Attempts to find a command by the given name.
     * @param name the name of the command
     */
    findCommand = (name: string): CommandEntry => this.commands.find(cmd => cmd.name === name)

    /**
     * Attempts to find a test flow by it's name.
     * @param name the name of the test flow
     */
    findFlow = (name: string): TestCommandEntry => this.testFlows.find(flow => flow.name === name);

    /**
     * Attempts to handle a command message.
     * 
     * @param user the user executing the command
     * @param message the message the user sent
     */
    async handle(user: User, message: Message) {
        let split = message.content.substring(1).split(' ');
        let name = split.splice(0, 1)[0];
        let args = split.splice(0, split.length);

        for (const cmd of this.commands) {
            if (cmd.name.toLowerCase() === name) {
                try {
                    if (cmd.command.internalCommand && !this.engine.opts.reportErrors.includes(message.guild.id))
                        break;

                    if (!this.engine.has(user, cmd.command.permission, message.guild)
                            && !this.hasAnyPermittedRoles(message, cmd)
                            && !this.isPermittedUser(message, cmd)) {
                        message.reply(this.engine.opts.commandMessages.permission(user, message, cmd.command));
                        break;
                    }

                    let helpEmbed = this.engine.embeds.build(
                        cmd.command.helpTitle 
                            ? cmd.command.helpTitle 
                            : `.${cmd.command.name} | Help Menu`, 
                        IvyEmbedIcons.HELP,
                        cmd.command.help,
                        cmd.command.helpFields, message);

                    if ((args.length === 1) && args[0].toLowerCase() === '-h') {
                        if (cmd.command.deleteMessage) {
                            message.delete();
                        }

                        message.reply(helpEmbed);
                        break;
                    }

                    let result = await cmd.command.execute(user, message, args);
                    if (cmd.command.deleteMessage) {
                        message.delete();
                    }
                    
                    if (result === CommandReturn.EXIT) {
                        break;
                    }

                    message.reply(helpEmbed);
                    break;
                } catch (e) {                    
                    if (this.engine.opts.reportErrors.includes(message.guild.id)) {
                        message.reply(this.engine.opts.commandMessages.commandErrorVerbose(user, message, name, args, e));
                        this.engine.logger.except(e, this.name, 'Encountered an exception while processing a command');
                        this.engine.logger.unlisted(e.stack);
                        return;
                    }

                    message.reply(this.engine.opts.commandMessages.commandError(user, message, name, args));
                    this.engine.logger.except(e, this.name, 'Encountered an exception while processing a command');
                }
            }
        }
    }

    private hasAnyPermittedRoles = (message: Message, { command }: CommandEntry) => {
        return message.member.roles.cache.some(role => command.permitRoles.some(raw => {
            if (conforms(SNOWFLAKE_REGEX, raw))
                return role.id === raw;
            return role.name.toLowerCase() === raw.toLowerCase();
        }));
    }

    private isPermittedUser = (message: Message, { command }: CommandEntry) => {
        return command.permitUsers.includes(message.author.id);
    }

}