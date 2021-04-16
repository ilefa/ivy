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

import { Document, FilterQuery, Model } from 'mongoose';

export class MongoProvider<T extends Document> {

    constructor(private model: Model<T>) {}

    get = async (filter: FilterQuery<T>): Promise<T> => await
        this
            .model
            .findOne(filter)
            .exec();

    set = async (value: T): Promise<T> => await
        this
            .model
            .create(value)
            .then(_ => value);

    delete = async (filter: FilterQuery<T>): Promise<boolean> => await
        this
            .model
            .deleteOne(filter)
            .then(_ => true)
            .catch(_ => false);

    find = async (filter: FilterQuery<T>): Promise<T[]> => await
        this
            .model
            .find(filter)
            .exec();

    exists = async (filter: FilterQuery<T>): Promise<boolean> => {
        let matches = await this.model.count(filter).exec();
        return matches > 0;
    }

}