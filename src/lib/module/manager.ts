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

import Module from './module';

import { Client } from 'discord.js';
import { IvyEngine } from '../engine';
import { numberEnding } from '../util';

export default class ModuleManager {

    engine: IvyEngine;
    client: Client;
    modules: Module[];

    constructor(engine: IvyEngine) {
        this.engine = engine;
        this.client = engine.client;
        this.modules = [];
    }

    /**
     * Registers a module into the manager.
     * @param module the module
     */
    async registerModule(module: Module) {
        module.client = this.client;
        module.manager = this;
    
        this.modules.push(module);
        await module.start();
    }

    init() {
        this.engine.logger.info('Modules', `Loaded & Enabled ${this.modules.length} module${numberEnding(this.modules.length)}.`);
    }

    disable() {
        this.modules.forEach(module => module.end());
        this.modules = [];
    }

}