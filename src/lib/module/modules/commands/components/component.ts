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


import { Module } from '../../../';
import { MultiCommand } from './multi';
import { CommandReturn } from '../command';
import { Message, User } from 'discord.js';

export abstract class CommandComponent<M extends Module> {

    name: string;
    help: string;
    manager: M;
    host: MultiCommand<M>;
    permission: number;

    constructor(name: string, help: string, permission: number) {
        this.name = name;
        this.help = help;
        this.permission = permission;
    }

    abstract execute(user: User, message: Message, args: string[]): Promise<CommandReturn>;

}