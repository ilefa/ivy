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

import { GuildResolvable } from 'discord.js';

import {
    GenericPredicate,
    GenericReducer,
    GenericSorter,
    GenericTransformer,
    resolvableToId
} from '.';

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
     * Overwrites the current value for a given guild,
     * or if it doesn't exist, creates a new guild entry
     * in the queue.
     * 
     * @param guild the guild to modify
     * @param elem the element to set
     */
    set = (guild: GuildResolvable, elem: T[]) => {
        this.queue.set(resolvableToId(guild), elem);
        
        // don't return the result of set() since it returns the map itself
        return;
    }

    /**
     * Either maps or overwrites the current value for
     * a given guild by means of mapping all of it's
     * current elements according to a provided
     * `transform` function.
     * 
     * If the `destructive` flag is true, overwrites the
     * current value for the queue, and regardless of
     * whether the flag is true, will return the mapped
     * queue.
     * 
     * @param guild the guild to modify
     * @param destructive whether or not to overwrite the queue
     * @param transform the function to transform it's elements
     */
    map = (guild: GuildResolvable, destructive: boolean, transform: GenericTransformer<T>) => {
        let queue = this.get(guild);
        if (!queue) return [];

        let mapped = queue.map(transform);
        if (destructive)
            this.set(guild, mapped);
        
        return mapped;
    }

    /**
     * Either just shuffles, or shuffles and overwrites the current
     * value for a given guild by means of utilizing the [Durstenfeld shuffle](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle#The_modern_algorithm)
     * algorithm.
     * 
     * If the `destructive` flag is true, overwrites the current
     * value for the queue, and regardless of whether the flag is
     * true, will return the shuffled queue.
     * 
     * @param guild the guild to modify
     * @param destructive whether or not the overwrite the queue
     */
    shuffle = (guild: GuildResolvable, destructive: boolean) => {
        let queue = [...this.get(guild)];
        for (let i = queue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [queue[i], queue[j]] = [queue[j], queue[i]];
        }

        if (destructive)
            this.set(guild, queue);

        return queue;
    }

    /**
     * Either just sorts, or sorts and overwrites the current
     * value for a given guild by means of sorting all of it's
     * elements according to the `func` parameter of this function.
     * 
     * If the `destructive` flag is true, overwrites the current
     * value for the queue, and regardless of whether the flag
     * is true, it will return the new sorted queue.
     * 
     * @param guild the guild to modify
     * @param destructive whether or not to overwrite the queue
     * @param func the sorting function which compares two elements
     */
    sort = (guild: GuildResolvable, destructive: boolean, func: GenericSorter<T>) => {
        let queue = this.get(guild);
        if (!queue) return [];

        let sorted = [...this.get(guild)].sort(func);
        if (destructive)
            this.set(guild, sorted);

        return sorted;
    }

    /**
     * Returns the length of the queue for a
     * provided guild.
     * 
     * @param guild the guild to look for
     */
    length = (guild: GuildResolvable) => this.get(guild).length;

    /**
     * Returns whether or not a provided guild
     * currently exists in the guild queue.
     * 
     * @param guild the guild to look for
     */
    has = (guild: GuildResolvable) => this.queue.has(resolvableToId(guild));

    /**
     * Returns whether any elements in the guild
     * queue for the specified guild match the
     * provided predicate.
     * 
     * @param guild the guild to look for
     * @param predicate the predicate to resolve
     */
    some = (guild: GuildResolvable, predicate: GenericPredicate<T>) => this.get(guild).some(predicate);

    /**
     * Returns whether every element in the guild
     * queue for the specified guild matches the
     * provided predicate.
     * 
     * @param guild the guild to look for
     * @param predicate the predicate to resolve
     */
    every = (guild: GuildResolvable, predicate: GenericPredicate<T>) => this.get(guild).every(predicate);

    /**
     * Returns whether no elements in the guild
     * queue for the specified guild match the
     * provided predicate.
     * 
     * @param guild the guild to look for
     * @param predicate the predicate to resolve
     */
    none = (guild: GuildResolvable, predicate: GenericPredicate<T>) => this.get(guild).filter(predicate).length === 0;

    /**
     * Reduces the elements in the guild queue
     * for the specified guild based on the
     * given reducer function.
     * 
     * @param guild the guild to look for
     * @param predicate the reducer to utilize
     */
    reduce = (guild: GuildResolvable, reducer: GenericReducer<T>) => this.get(guild).reduce(reducer);

    /**
     * Filters out elements that match the given
     * predicate in the guild queue for the
     * specified guild.
     * 
     * @param guild the guild to look for
     * @param predicate the predicate to resolve
     */
    filter = (guild: GuildResolvable, predicate: GenericPredicate<T>) => this.get(guild).filter(predicate);

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

    /**
     * Clears all values from the queue.
     */
    flush = () => this.queue.clear();

}