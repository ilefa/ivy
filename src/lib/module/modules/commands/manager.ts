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
import { codeBlock, generateEmbed, generateSimpleEmbed, numberEnding } from '../../../util';
import { Command, CommandEntry, CommandReturn, GenericTestCommand, TestCommand, TestCommandEntry } from '.';

export class CommandManager extends Module {
    
    client: Client;
    engine: IvyEngine;
    commands: CommandEntry[];
    testFlows: TestCommandEntry[];
    
    constructor(engine: IvyEngine) {
        super('Commands');
        this.engine = engine;
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
    registerCommand(name: string, command: Command) {
        command.manager = this;
        this.commands.push(new CommandEntry(name, command));
    }

    /**
     * Registers a test flow with the given parameters.
     * 
     * @param command the command class
     */
    registerTestFlow(flow: TestCommand) {
        flow.manager = this;
        this.testFlows.push(new TestCommandEntry(flow.name, flow));
    }

    /**
     * Registers a generic test flow with the given parameters.
     * 
     * @param command the command class
     */
    registerGenericTestFlow<M extends Module>(flow: GenericTestCommand<M>, module: M) {
        flow.manager = this;
        flow.module = module;
        this.testFlows.push(new TestCommandEntry(flow.name, flow));
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
                    if (!this.engine.has(user, cmd.command.permission, message.guild)) {
                        message.reply(generateSimpleEmbed('Whoops', IvyEmbedIcons.ERROR, `You don't have permission to do this.`));
                        break;
                    }

                    let helpEmbed = generateEmbed(
                        cmd.command.helpTitle 
                            ? cmd.command.helpTitle 
                            : `.${cmd.command.name} | Help Menu`, 
                        IvyEmbedIcons.HELP,
                        cmd.command.help,
                        cmd.command.helpFields);

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
                        message.reply(generateEmbed('Huh? That wasn\'t supposed to happen..', IvyEmbedIcons.ERROR, `Something went wrong while processing your command.`, [
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
                                value: codeBlock('', e.message),
                                inline: false
                            },
                            {
                                name: 'Stacktrace',
                                value: codeBlock('', e.stack),
                                inline: false
                            }
                        ]));

                        this.engine.logger.except(e, this.name, 'Encountered an exception while processing a command');
                        console.error(e.stack);
                        return;
                    }

                    message.reply(generateSimpleEmbed('Huh? That wasn\'t supposed to happen..', IvyEmbedIcons.ERROR, 'Something went wrong while processing your command.'));
                    this.engine.logger.except(e, this.name, 'Encountered an exception while processing a command');
                }
            }
        }
    }

}