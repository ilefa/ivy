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

import { Logger } from '../logger';
import { Client } from 'discord.js';
import { ModuleManager } from './manager';

export abstract class Module {

    client: Client;
    manager: ModuleManager;
    logger: Logger;

    constructor(public name: string, private logPrefix?: string) {}

    /**
     * Called when the module is enabled.
     */
    abstract start(): void;

    /**
     * Called when the module is disabled.
     */
    abstract end(): void;

    /**
     * Logs the supplied message.
     * @param message the message to log
     */
    log = (message: string) => this.manager.engine.logger.info(this.logPrefix || this.name, message);

    /**
     * Logs the supplied warning.
     * @param message the message to warn
     */
    warn = (message: string) => this.manager.engine.logger.warn(this.logPrefix || this.name, message);

    /**
     * Logs the supplied error.
     * @param message the error to log
     */
    severe = (message: string) => this.manager.engine.logger.severe(this.logPrefix || this.name, message);
    
    /**
     * Logs the supplied exception.
     * 
     * @param error the error to log
     * @param message the base message
     */
    except = <E extends Error>(error: E, message: string) => this.manager.engine.logger.except(error, this.logPrefix || this.name, message);

}