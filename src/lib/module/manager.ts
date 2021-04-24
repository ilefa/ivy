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

import { Module } from './module';
import { Client } from 'discord.js';
import { IvyEngine } from '../engine';
import { numberEnding } from '../util';

export class ModuleManager {

    client: Client;
    modules: Module[];

    constructor(public engine: IvyEngine) {
        this.client = engine.client;
        this.modules = [];
    }

    /**
     * Registers a module into the manager.
     * @param module the module
     */
    async registerModule(module: Module) {
        if (this.modules.some(m => m.name.toLowerCase() === module.name.toLowerCase())) {
            throw new Error(`Ambigious module name '${module.name}'!`);
        }

        module.client = this.client;
        module.manager = this;
    
        this.modules.push(module);
        await module.start();
    }

    unregisterModule = async (module: Module) => {
        if (!this.modules.includes(module) || !this.modules.some(m => m.name.toLowerCase() === module.name.toLowerCase())) {
            throw new Error(`Module '${module.name}' is not registered.`);
        }

        await module.end();
        this.modules = this.modules.filter(m => m.name.toLowerCase() !== module.name.toLowerCase());
    }

    require = <T extends Module>(name: string) => 
        this
            .modules
            .find(module => module.name.toLowerCase() === name.toLowerCase()) as T;

    init() {
        this.engine.logger.info('Modules', `Loaded & Enabled ${this.modules.length} module${numberEnding(this.modules.length)}.`);
    }

    disable() {
        this.modules.forEach(module => module.end());
        this.modules = [];
    }

}