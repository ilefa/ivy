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

import { RedisClient } from 'redis';
import { Datastore } from '../store';
import { AsyncRedisClient, RedisConnection } from '../../util';

export type RedisFindParams<T> = {
    selector?: string;
    predicate: (key: string, value: T) => boolean;
}

export class RedisProvider implements Datastore {

    private redis: AsyncRedisClient;

    constructor(public connection: RedisConnection, client?: RedisClient) {
        this.redis = new AsyncRedisClient(connection, client);
    }

    private _retrieveAll = async <T>(selector?: string) => {
        let path = selector || '*';
        let results = await this.redis.keys(path);
        if (!results) {
            return [];
        }

        return Promise
            .all(results
                .map(async key => {
                    return {
                        key,
                        value: await this.get(key) as T
                    }
                }))
    }

    get = async <T>(key: string): Promise<T> => JSON.parse(await this.redis.get(key)) as T;

    getAs = async <T, R>(key: string, deserialize: (val: T) => R): Promise<R> => deserialize(await this.get(key));

    set = async <T>(key: string, value: T): Promise<T> => await
        this
            .redis
            .set(key, JSON.stringify(value))
            .then(_ => value);

    setAs = async <T, R>(key: string, value: T, serialize: (val: T) => R): Promise<T> => await
        this
            .set(key, serialize(value))
            .then(_ => value);

    delete = async (key: string): Promise<boolean> => await
        this
            .redis
            .del(key)
            .then(_ => _ > 0)
            .catch(_ => false);

    find = async <T>(params: RedisFindParams<T>): Promise<T[]> => {
        let all = await this._retrieveAll<T>(params.selector);
        if (!all) {
            return [];
        }

        return all
            .filter(ent => params.predicate(ent.key, ent.value))
            .map(ent => ent.value);
    }
    
    exists = async (key: string): Promise<boolean> => await this.redis.exists(key); 

}