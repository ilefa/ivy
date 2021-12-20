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

import { Module } from '../module';
import { IvyEngine } from '../../engine';
import { CommandManager } from './commands';

import {
    Message, 
    MessageReaction,
    PartialMessageReaction
} from 'discord.js';

export abstract class EventManager extends Module {
    
    engine: IvyEngine;
    commandCenter: CommandManager;

    constructor(engine: IvyEngine) {
        super('Events');
        this.engine = engine;
        this.commandCenter = this.engine.commandManager;
    }

    start() {
        let self = this;

        this.client.on('message', _ => self.onMessage(_));
        this.client.on('messageReactionAdd', _ => self.onReact(_));
        this.client.on('messageReactionRemove', _ => self.onReactRemoved(_));
        this.client.on('error', _ => self.onDiscordError(_));

        process.on('unhandledRejection', (err: any) => this.onRejection(err));
        process.on('uncaughtException', (err: any) => this.onException(err));
    }
    
    end() {}

    /**
     * Fired when an incoming message is received.
     * @param message the incoming message
     */
    onMessage = async (message: Message) => {
        if (!this.loaded)
            return;

        if (message.author.bot)
            return;
              
        let provider = await this
            .engine
            .opts
            .provider
            .load(message.guild);
            
        if (!message.content.startsWith(provider.prefix))
            return;
    
        this.commandCenter.handle(message.author, message);
    }

    /**
     * Fired when a reaction is added to a message.
     * @param reaction the added reaction
     */
    onReact = (_reaction: MessageReaction | PartialMessageReaction) => {}

    /**
     * Fired when a reaction is removed from a message.
     * @param reaction the removed reaction
     */
    onReactRemoved = (_reaction: MessageReaction | PartialMessageReaction) => {}

    /**
     * Fired if Discord.js encounters an unhandled exception.
     * @param error the encountered error
     */
    onDiscordError = (error: Error) => this.handleException(error, `Discord.js encountered an exception`);
    
    /**
     * Fired if a promise has an unhandled rejection anywhere in the codebase.
     * @param error the encountered error
     */
    onRejection = (error: Error) => this.handleException(error, `Encountered a uncaught rejection`);

    /**
     * Fired if an unhandled exception is thrown anywhere in the codebase.
     * @param error the encountered error
     */
    onException = (error: Error) => this.handleException(error, 'Encountered a uncaught exception');

    private handleException = (error: Error, head: string) => {
        if (!this.loaded)
            return;
            
        this.engine.logger.except(error, this.engine.opts.name, head);
        this.engine.logger.severe(this.engine.opts.name, error.stack);
    }
    
}

export class DefaultEventManager extends EventManager {

    engine: IvyEngine; 

    constructor(engine: IvyEngine) {
        super(engine);
    }

}