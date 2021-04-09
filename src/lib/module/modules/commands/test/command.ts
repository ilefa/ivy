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

import { TestFlow } from './flow';
import { Message, User } from 'discord.js';
import { GenericTestCommand } from './generic';
import { Command, CommandReturn } from '../command';
import { codeBlock, CUSTOM_PERMS, emboss, timeDiff } from '../../../../util';

export abstract class TestCommand extends Command implements TestFlow {

    constructor(public name: string) {
        super(name, null, null, [], CUSTOM_PERMS.SUPER_PERMS);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        message.channel.send(`Executing test flow ${emboss(this.name)}..`);
    
        try {
            let start = Date.now();
            let result = await this.run(message);
            if (result instanceof Error) {
                message.channel.send(`:warning: Test flow ${emboss(this.name)} finished with an error in ${emboss(timeDiff(start) + 'ms')}.
                    ${`\n${codeBlock('', result.stack)}`}`);
                return CommandReturn.EXIT;
            }

            message.channel.send(`:white_check_mark: Test flow ${emboss(this.name)} finished in ${emboss(timeDiff(start) + 'ms')}.
                ${result ? `\n${codeBlock('json', JSON.stringify(result, null, 3))}` : ''}`);
        } catch (e) {
            message.channel.send(`:x: Encountered an exception while executing test flow ${emboss(this.name)}..`);
            message.channel.send(`:x: Stack Trace:\n${codeBlock('', e.stack)}`)
        }
        
        return CommandReturn.EXIT;
    }

    abstract run(message?: Message): any;

}

export class TestCommandEntry {

    /**
     * A wrapped test flow instance.
     * 
     * @param name the name of the flow
     * @param command the flow object
     */
    constructor(public name: string, public command: TestCommand | GenericTestCommand<any>) {}

}