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

import { Logger } from '../../../logger';
import { CommandManager } from './manager';
import { IvyEngine } from '../../../engine';
import { EmbedBuilder } from '../../../util';

import {
    EmbedFieldData,
    Message,
    MessageEmbed,
    MessageOptions,
    MessagePayload,
    PermissionResolvable,
    User
} from 'discord.js';

export type CommandEntry = {
    name: string;
    command: Command;
}

export enum CommandReturn {
    EXIT, HELP_MENU
}

export abstract class Command {
    
    engine: IvyEngine;
    embeds: EmbedBuilder;
    logger: Logger;
    manager: CommandManager;

    /**
     * Default constructor for a command
     * 
     * @param name the name of the command (used to execute)
     * @param help the help message of the command
     * @param helpTitle the custom title of the help embed
     * @param helpFields the fields of the help message embed
     * @param permission the required permission
     * @param deleteMessage whether or not to delete the original command message
     * @param hideFromHelp whether or not to hide this command from the help menu
     * @param category the category this command falls under
     * @param permitRoles an array of role names or ids that are permitted to execute this command
     * @param permitUsers an array of user ids that are permitted to execute this command
     * @param internalCommand whether or not to only run when executed on a server included in the `reportErrors` array
     */
    constructor(public name: string,
                public help: string,
                public helpTitle: string,
                public helpFields: EmbedFieldData[],
                public permission: PermissionResolvable | 'SUPER_PERMS',
                public deleteMessage = true,
                public hideFromHelp = false,
                public category: string = null,
                public permitRoles: string[] = [],
                public permitUsers: string[] = [],
                public internalCommand = false) {
    }

    start() {
        this.engine = this.manager.engine;
        this.embeds = this.engine.embeds;
        this.logger = this.engine.logger;
    }

    /**
     * Command Execution Method
     * 
     * @param user the user who executed the command
     * @param message the original message object
     * @param args the arguments provided for the command
     */
    abstract execute(user: User, message: Message, args: string[]): Promise<CommandReturn>;

    /**
     * Responds to a message with the provided parameters.
     * 
     * @param message the message to respond to
     * @param content the content to respond with
     * @param ping whether or not the ping the author of the original message
     */
    reply(message: Message, content: string | MessageEmbed, ping = false) {
        let opts: MessagePayload | MessageOptions = typeof content === 'string'
            ? { content }
            : { embeds: [content] };

        return ping
            ? message.reply(opts)
            : message.channel.send(opts);
    }

}