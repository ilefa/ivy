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

import { Stash } from '../stash';
import { Guild } from 'discord.js';
import { IvyEngine } from '../engine';
import { GuildDataProvider } from './provider';

export type CachedGuildDataProviderPrefs = {
    redis: {
        host: string;
        port?: number;
        auth?: boolean;
        password?: string;
        database?: number;
    },
    expiry?: number;
}

export abstract class CachedGuildDataProvider<P> implements GuildDataProvider<P> {

    private stash: Stash<Guild, P>;

    constructor(private engine: IvyEngine, prefs: CachedGuildDataProviderPrefs) {
        this.stash = new Stash({
            host: prefs.redis.host,
            port: prefs.redis.port || 6379,
            auth: !!prefs.redis.auth,
            password: prefs.redis.password,
            database: prefs.redis.database || 0,
            keyspace: {
                prefix: 'guildData',
                delimiter: '.',
                serialize: _ => _.id,
                deserialize: _ => {
                    let guild = this.getFromCache(_);
                    if (!guild) this.loadToCache(_);
                    return this.getFromCache(_);
                }
            },
            serializers: {
                resultTransformer: res => JSON.parse(res),
                typeTransformer: res => JSON.stringify(res)
            }
        });
    }

    /**
     * Inserts a guild into the Discord.js
     * server cache for usage in deserialization.
     * 
     * @param guild the guild to load
     */
    private loadToCache = (guild: string) =>
        this
            .engine
            .client
            .guilds
            .fetch(guild);

    /**
     * Retrieves a guild from the Discord.js
     * server cache for usage in deserialization.
     * 
     * @param guild the guild to retrievw
     */
    private getFromCache = (guild: string) =>
        this
            .engine
            .client
            .guilds
            .cache
            .find(_ => _.id === guild);

    /**
     * Overriden GuildDataProvider#load() which utilizes
     * a stash to cache server data in a Redis database.
     * 
     * If the server data is not in the cache, it will
     * attempt to load it using local abstract function
     * CachedGuildDataProvider#fetch(), and stashes that result.
     * 
     * @param guild the guild to load
     */
    load = async (guild: Guild): Promise<P> => {
        let data = await this.stash.retrieve(guild)
        if (!data) {
            let remote = await this.fetch(guild);
            this.stash.store(guild, remote);
            return remote;
        }

        return data;
    };

    /**
     * Abstract logic as to how to fetch
     * a GuildData token from whatever datasource
     * the inheriting client is using.
     * 
     * This can be considered written as the normal
     * load method provided by GuildDataProvider, as
     * the inherited load function in this class takes
     * care of caching the data and retrieval when necessary.
     * 
     * @param guild the guild to fetch
     */
    abstract fetch(guild: Guild): Promise<P>;

    /**
     * Overriden GuildDataProvider#save() which when
     * called will update both the Redis stash, and call
     * the abstract update() function, which will actually
     * save the data to whichever datasource the inheriting
     * project desires.
     * 
     * @param guild the guild to load
     */
    save = async (guild: Guild, data: P) => {
        await this.stash.update(guild, data).catch(_ => data);
        await this.update(guild, data);
        return data;
    }

    /**
     * Inherited logic as to how to save
     * a GuildData token to whatever datasource
     * the inheriting 
     * 
     * @param guild the guild to save
     * @param data the guild data to save
     */
    abstract update(guild: Guild, data: P): Promise<void>;

}