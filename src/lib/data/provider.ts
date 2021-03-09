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

import { Guild } from 'discord.js';

export interface GuildDataProvider<P> {
    
    /**
     * Attempts to retrieve guild data of type P
     * from whatever source is available by the
     * implementing service.
     * 
     * @param guild the guild to retrieve data for
     */
    load(guild: Guild): P;
    
    /**
     * Attempts to save guild data of type P
     * for a specified guild to any available
     * data source, as specified by the
     * implementing service.
     * 
     * @param guild the guild to save data for
     * @param data the data to save for the guild
     */
    save(guild: Guild, data: P): void;

}

export type GuildTokenLike = {
    prefix: string;
}