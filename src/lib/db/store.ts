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

export interface Datastore {

    /**
     * Attempts to retrieve a value of type T
     * stored as the provided key in the database.
     * 
     * @param key the key in the database
     */
    get<T>(key: string): Promise<T>;

    /**
     * Attempts to retrieve a value of type T
     * stored as the provided key in the database,
     * and then deserializes the result based on
     * the provided ``deserialize`` function.
     * 
     * @param key the key in the database
     * @param deserialize a function to deserialize the value
     */
    getAs<T, R>(key: string, deserialize: (val: T) => R): Promise<R>;

    /**
     * Attempts to set a value in the database
     * under the specified key.
     * 
     * @param key the key to store it as
     * @param value the value to store
     */
    set<T>(key: string, value: T): Promise<T>;

    /**
     * Attempts to set a value in the database
     * under the specified key, and transformed
     * as described in the ``serialize`` function.
     * 
     * @param key the key to store it as
     * @param value the value to store
     * @param serialize a function to serialize the value
     */
    setAs<T, R>(key: string, value: T, serialize: (val: T) => R): Promise<T>;

    /**
     * Deletes a value from the database
     * through its assigned key.
     * 
     * @param key the key to delete
     */
    delete(key: string): Promise<boolean>;

    /**
     * Attempts to find all values matching
     * a given predicate.
     * 
     * @param predicate the predicate to search with
     */
    find<T>(predicate: any): Promise<T[]>;

    /**
     * Attempts to check if a given key
     * exists in the database.
     * 
     * @param key the key to check
     */
    exists(key: string): Promise<boolean>;

}