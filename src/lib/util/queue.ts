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

import { resolvableToId } from '.';
import { GuildResolvable } from 'discord.js';

export class GuildQueue<T> {

    private queue: Map<string, T[]>;

    constructor() {
        this.queue = new Map();
    }

    /**
     * Returns the current queue for a given guild,
     * if it exists.
     * 
     * @param guild the guild to look for
     */
    get = (guild: GuildResolvable) => this.queue.get(resolvableToId(guild));

    /**
     * Pushes a new item to the end of the guild
     * queue for the provided guild, and creates
     * a new guild queue if none exists.
     * 
     * @param guild the guild to modify
     * @param item the item to push
     */
    push = (guild: GuildResolvable, item: T) => {
        let queue = this.get(guild);
        let id = resolvableToId(guild);
        if (!queue) {
            this.queue.set(id, [item]);
            return;
        }
        
        this.queue.set(id, [...queue, item]);
    }

    /**
     * Pops the first item off of the queue
     * and returns it, while subsequently
     * advancing the queue.
     * 
     * @param guild the guild to modify
     * @param item the item to push
     */
    pop = (guild: GuildResolvable) => {
        let queue = this.get(guild);
        if (!queue)
            return null;
        
        let newQueue = queue.slice(1);
        this.queue.set(resolvableToId(guild), newQueue);
        return newQueue[0];
    }

    /**
     * Returns the current item in a guild queue
     * without modifying the queue, if it exists.
     * 
     * @param guild the guild to look for
     */
    peek = (guild: GuildResolvable) => {
        let queue = this.get(guild);
        if (!queue)
            return null;
            
        return queue[0];
    }

    /**
     * Clears a queue for the provided guild
     * if it exists.
     * 
     * @param guild the guild to modify
     */
    clear = (guild: GuildResolvable) => {
        let queue = this.get(guild);
        if (!queue)
            return;

        this.queue.set(resolvableToId(guild), []);
    }

}