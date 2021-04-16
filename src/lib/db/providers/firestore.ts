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

import { Datastore } from '../store';
import { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot } from '@google-cloud/firestore';

export class FirestoreProvider implements Datastore {

    constructor(private store: FirebaseFirestore.Firestore, private collection: string) {}
    
    private _doc = (key: string) => 
        this
            .store
            .collection(this.collection)
            .doc(key);

    get = async <T>(key: string): Promise<T> => await
        this
            ._doc(key)
            .withConverter(link<T>())
            .get().then(res => res.data());
    
    getAs = async <T, DocumentData>(key: string, deserialize: (val: DocumentData) => T): Promise<T> => await
        this
            ._doc(key)
            .withConverter(transmute<T>({
                deserialize,
                serialize: _ => _
            }))
            .get().then(res => res.data());

    set = async <T>(key: string, value: T): Promise<T> => await
        this
            ._doc(key)
            .set(value)
            .then(_ => value);

    setAs = async <T, R>(key: string, value: T, serialize: (val: T) => R): Promise<T> => await
        this
            ._doc(key)
            .set(serialize(value))
            .then(_ => value);

    delete = async (key: string): Promise<boolean> => await
        this
            ._doc(key)
            .delete()
            .then(_ => true)
            .catch(_ => false);

    find = async <T>(predicate: FirebaseSearchQuery): Promise<T[]> => {
        let snapshot = await this
            .store
            .collection(this.collection)
            .where(predicate.field, predicate.filter, predicate.value)
            .withConverter(link<T>())
            .get(); 

        if (snapshot.empty) {
            return [];
        }

        return snapshot.docs.map(doc => doc.data());
    }

    exists = async (key: string): Promise<boolean> => await
        this
            ._doc(key)
            .get()
            .then(_ => true)
            .catch(_ => false);

}

export type FirebaseSearchQuery = {
    field: string | FirebaseFirestore.FieldPath;
    filter: FirebaseFirestore.WhereFilterOp;
    value: any;
}

type TransmuteProps<T> = {
    serialize: (object: T) => DocumentData;
    deserialize: (snapshot: DocumentData) => T;
}

/**
 * Transmutes an object of type T to and from a Firestore compatible DocumentData.
 * @param props serialization and deserialization routines to run on provided data
 */
const transmute = <T>(props: TransmuteProps<T>): FirestoreDataConverter<T> => {
    return {
        toFirestore: (obj: T) => props.serialize(obj),
        fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>) => props.deserialize(snapshot.data())
    }
}

/**
 * One-to-one links data to a DocumentData object and back.
 */
const link = <T>(): FirestoreDataConverter<T> => {
    return {
        toFirestore: (obj: T) => obj,
        fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>) => snapshot.data() as T
    }
}