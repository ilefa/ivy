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

import { UserResolvable } from 'discord.js';

export class RechargeManager {

    private map: Map<string, number>;
    
    constructor() {
        this.map = new Map();
    }

    /**
     * Applies a cooldown on the specified user
     * if they are not already on a cooldown,
     * which in that case would return false.
     * 
     * @param user the user to put on cooldown
     * @param timeout the cooldown to apply
     */
    recharge = (user: UserResolvable, timeout: number) => {
        let id = user.toString();
        if (this.isRecharging(user))
            return false;

        this.map.set(id, Date.now() + timeout);
        return true;
    }

    /**
     * Attempts to removes an applied cooldown
     * from the specified user, and returns
     * whether or not it was successful.
     * 
     * @param user the user to remove from cooldown
     */
    removeRecharge = (user: UserResolvable) => this.map.delete(user.toString());

    /**
     * Removes all applied cooldowns stored
     * in the local recharge map.
     */
    clearRecharges = () => this.map.clear();

    /**
     * Returns whether or not a given
     * user is currently on cooldown
     * for this recharge manager.
     * 
     * @param user the user to check
     */
    isRecharging = (user: UserResolvable) => {
        let id = user.toString();
        if (!this.map.has(id))
            return false;

        let time = this.map.get(id);
        if (time < Date.now()) {
            this.map.delete(id);
            return false;
        }

        return true;
    }

    /**
     * Attempts to return the time left
     * on a user's cooldown, otherwise returns -1.
     * 
     * @param user the user to check
     */
    getRechargeTime = (user: UserResolvable) => {
        let id = user.toString();
        if (!this.isRecharging(user))
            return -1;

        return this.map.get(id) - Date.now();
    }

}