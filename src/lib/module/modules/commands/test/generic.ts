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

import Module from '../../../module';

import { GenericTestFlow } from './flow';
import { User, Message } from 'discord.js';
import { Command, CommandReturn } from '../command';
import { codeBlock, CUSTOM_PERMS, emboss, timeDiff } from '../../../../util';

export abstract class GenericTestCommand<M extends Module> extends Command implements GenericTestFlow<M> {

    module: M;
    name: string;

    constructor(name: string) {
        super(name, null, null, [], CUSTOM_PERMS.SUPERMAN);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        message.channel.send(`Executing test flow ${emboss(this.name)}..`);
        
        try {
            let start = Date.now();
            let result = await this.run(this.module, message);
            if (result instanceof Error) {
                message.channel.send(`:warning: Test flow ${emboss(this.name)} finished with an error in ${emboss(timeDiff(start) + 'ms')}.
                    ${`\n${codeBlock('', result.stack)}`}`);
                return CommandReturn.EXIT;
            }

            message.channel.send(`:white_check_mark: Test flow ${emboss(this.name)} finished in ${emboss(timeDiff(start) + 'ms')}.
                ${result ? `\n${codeBlock('json', JSON.stringify(result, null, 3))}` : ''}`);
        } catch (e) {
            message.channel.send(`:warning: Encountered an exception while executing test flow ${emboss(this.name)}..`);
            message.channel.send(`:warning: Stack Trace:\n${codeBlock('', e.stack)}`)
        }   

        return CommandReturn.EXIT;
    }

    abstract run(manager: M, message?: Message): any;

}