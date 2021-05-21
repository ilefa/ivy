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
import { bold } from '../../../../util';
import { CommandComponent } from './component';
import { Command, CommandReturn } from '../command';
import { EmbedFieldData, Message, User } from 'discord.js';

export abstract class MultiCommand<M extends Module> extends Command {
    
    components: Map<string, CommandComponent<M>>;

    constructor(public base: string,
                public basePermission: number,
                public baseManager: M,
                public baseHelp: string = 'Invalid usage, available subcommands are listed below.') {
        super(base, baseHelp, null, [], basePermission);

        this.base = base;
        this.baseManager = baseManager;
        this.basePermission = basePermission;
        this.components = new Map<string, CommandComponent<M>>();

        this.registerComponents();
        this.generateHelpFields();
    }

    /**
     * Intended to be used to register all
     * known components for a MultiCommand.
     */
    abstract registerComponents(): void;

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        let component = this.getComponent(args);
        if (!component) {
            return CommandReturn.HELP_MENU;
        }

        if (!this.manager.engine.has(user, this.permission, message.guild)) {
            message.reply(this.engine.opts.commandMessages.permission(user, message, this));
            return CommandReturn.EXIT;
        }

        let newArgs = args.slice(1);
        return component.execute(user, message, newArgs);
    }

    register(components: CommandComponent<M> | CommandComponent<M>[]) {
        if (components instanceof CommandComponent) {
            components.manager = this.baseManager;
            components.host = this;
            this.components.set(components.name, components);
            return;
        }

        components.forEach(component => {
            component.manager = this.baseManager;
            component.host = this;
            this.components.set(component.name, component);
        });
    }

    private getComponent(args: string[]): CommandComponent<M> {
        return this.components.get(args[0]?.toLowerCase());
    }

    private generateHelpFields() {
        let helpStr = '';
        this.components.forEach((v, k) => {
            if (v.help === v.name) {
                helpStr += bold('.' + this.base + ' ' + v.name) + '\n';
                return;
            }

            helpStr += bold('.' + this.base + ' ' + v.name) + ' ' + v.help.split(v.name)[1].trim() + '\n';
        });

        let helpField: EmbedFieldData = {
            name: 'Command List',
            value: helpStr.trim(),
            inline: false
        }

        this.helpFields = [helpField, ...this.helpFields];
    }

}