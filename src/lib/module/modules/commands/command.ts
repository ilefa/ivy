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

import { CommandManager } from './manager';
import { User, Message, EmbedFieldData } from 'discord.js';

export abstract class Command {
    
    name: string;
    help: string;
    helpTitle: string;
    helpFields: EmbedFieldData[];
    permission: number;
    deleteMessage: boolean;
    hideFromHelp: boolean;
    internalOnly: boolean;
    fcOnly: boolean;
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
     */
    constructor(name: string,
                help: string,
                helpTitle: string,
                helpFields: EmbedFieldData[],
                permission: number,
                deleteMessage = true,
                hideFromHelp = false) {
        this.name = name;
        this.help = help;
        this.helpTitle = helpTitle;
        this.helpFields = helpFields;
        this.permission = permission;
        this.deleteMessage = deleteMessage;
        this.hideFromHelp = hideFromHelp;
    }

    /**
     * Command Execution Method
     * 
     * @param user the user who executed the command
     * @param message the original message object
     * @param args the arguments provided for the command
     */
    abstract execute(user: User, message: Message, args: string[]): Promise<CommandReturn>;

}

export class CommandEntry {
    
    name: string;
    command: Command;

    /**
     * A wrapped command instance.
     * 
     * @param name the name of the command
     * @param command the command object
     */
    constructor(name: string, command: Command) {
        this.name = name;
        this.command = command;
    }

}

export enum CommandReturn {
    EXIT, HELP_MENU
}