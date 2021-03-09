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

import { Client } from 'discord.js';
import { ModuleManager } from './manager';

export abstract class Module {

    name: string;
    client: Client;
    manager: ModuleManager;

    constructor(name: string) {
        this.name = name;
    }

    /**
     * Called when the module is enabled.
     */
    abstract start(): void;

    /**
     * Called when the module is disabled.
     */
    abstract end(): void;

}