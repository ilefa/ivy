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

import moment from 'moment';
import df from 'parse-duration';

import { Readable } from 'stream';
import { Units } from 'parse-duration';

import {
    ChannelResolvable,
    Client,
    Emoji,
    GuildResolvable,
    Guild,
    GuildChannel,
    GuildEmoji,
    GuildMember,
    Invite,
    Message,
    Permissions,
    PermissionFlags,
    Role,
    StreamOptions,
    User,
    UserResolvable,
    VoiceBroadcast,
    VoiceChannel,
    VoiceConnection,
    VoiceState
} from 'discord.js';

export * from './embed';
export * from './paginator';
export * from './queue';
export * from './recharge';
export * from './redis';

export const DAY_MILLIS = 864e5;
export const DATE_FORMAT = 'MMMM Do YYYY, h:mm:ss a';
export const LOADER = '<a:loading:788890776444207194>';
export const LOOKING = '<a:looking:807057053713039420>';
export const JOIN_BUTTON = '<:join:798763992813928469>';
export const LEAVE_BUTTON = '<:leave:848364381645307926>';
export const RED_CIRCLE = '<:yellow:848364257640054805>';
export const YELLOW_CIRCLE = '<:green:848364257434927125>';
export const GREEN_CIRCLE = '<:green:848364257434927125>';
export const BLUE_CIRCLE = '<:blue:848364257577271296>';
export const GRAY_CIRCLE = '<:gray:848364257644773416>';

export const SNOWFLAKE_REGEX = /^\d{18,}$/;
export const EMOTE_REGEX = /<(a|):\w+:\d{18,}>/;
export const USER_MENTION_REGEX = /^<@\!\d{18,}>$/;

export const URL_REGEX = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;

export type GenericPredicate<T> = (elem: T, index: number) => boolean;
export type GenericReducer<T> = (prev: T, current: T, index: number) => T;
export type GenericSorter<T> = (a: T, b: T) => number;
export type GenericTransformer<T> = (elem: T, index: number) => T;

export const DEFAULT_STREAM_OPTS: StreamOptions = {
    type: 'opus',
    volume: 1
}

export type VoiceConnectionPrefs = {
    source: VoiceBroadcast | Readable | string;
    stream: StreamOptions;
    volume?: number;
    onConnect?: (channel: VoiceChannel) => void;
    onFinish?: (channel: VoiceChannel) => void;
    onError?: (channel: VoiceChannel, err: Error) => void;
}

export enum VoiceStateChange {
    CONNECT,
    DISCONNECT,
    DEAF,
    MUTE,
    UNDEAF,
    UNMUTE,
    SERVER_DEAF,
    SERVER_MUTE,
    SERVER_UNDEAF,
    SERVER_UNMUTE,
    STREAM,
    STREAM_STOP,
    UNKNOWN
}

enum VoiceConnectionMatchType { GUILD, CHANNEL }

export type MessageLoader = {
    message: Message;
    start: number;
}

export type SearchAndReplace = {
    search: string | RegExp;
    replacement: string;
    useRegularReplace?: boolean;
}

// Discord utilities
export const bold = (message: any) => `**${message}**`;
export const italic = (message: any) => `*${message}*`;
export const emboss = (message: any) => `\`\`${message}\`\``;
export const link = (display: string, link: string) => `[${display}](${link})`;
export const codeBlock = (lang: string, message: any) => `\`\`\`${lang}\n${message}\`\`\``;
export const asEmote = (emote: Emoji) => `<${emote.animated ? 'a' : ''}:${emote.name}:${emote.id}>`;
export const asMention = (user: User | string) => `<@${user instanceof User ? user.id : user}>`;
export const resolveEmote = (client: Client, id: string) => client.emojis.cache.get(id);
export const mentionRole = (role: Role | string) => `<@&${role instanceof Role ? role.id : role}>`;
export const mentionChannel = (id: string) => `<#${id}>`;

// Time-related utilities
export const toDuration = (input: string, unit: Units = 's') => df(input, unit);
export const timeDiff = (start: number) => (Date.now() - start).toFixed(2);
export const time = (time: number, format: string = DATE_FORMAT) => moment(time).format(format);
export const now = (format: string = DATE_FORMAT) => time(Date.now(), format);

// Element validation
export const conforms = (regex: RegExp, target: string) => regex.test(target);
export const isURL = (raw: string) => conforms(URL_REGEX, raw);
export const isEmote = (raw: string) => conforms(EMOTE_REGEX, raw);
export const isSnowflake = (raw: string) => conforms(SNOWFLAKE_REGEX, raw);
export const isUserMention = (raw: string) => conforms(USER_MENTION_REGEX, raw);

// String-related utilities
export const cond = (cond: boolean, t: string, f: string) => cond ? t : f;
export const onOff = (condition: boolean) => cond(condition, 'On', 'Off');
export const numberEnding = (num: number) => num === 1 ? '' : 's';
export const capitalizeFirst = (input: string) => input
    .split(' ')
    .map(str => str.charAt(0).toUpperCase() + str.slice(1))
    .join('');

/**
 * Attempts to convert a guild or user resolvable
 * object into a guild or user id, depending on which
 * is provided.
 * 
 * @param resolvable either a guild or user resolvable object
 */
export const resolvableToId = (resolvable: UserResolvable | GuildResolvable) => {
    if (resolvable instanceof String)
        return resolvable.toString();

    if (resolvable instanceof Guild
            || resolvable instanceof GuildMember
            || resolvable instanceof User)
        return resolvable.id;

    if (resolvable instanceof Invite
            || resolvable instanceof Message
            || resolvable instanceof GuildChannel
            || resolvable instanceof GuildEmoji
            || resolvable instanceof Role)
        return resolvable.guild.id;

    return null;
}

/**
 * Attempts to find a voice connection for the given
 * match, or uses a manually specified predicate.
 * 
 * @example
 * ```ts
 * // searches for a voice connection active in the provided guild or voice channel
 * getVoiceConnection(client, guild | channel)
 * 
 * // searches for a voice connection active in the provided channel by using a manual predicate
 * getVoiceConnection(client, null, connection => connection.channel.id === channel.id)
 * ```
 * 
 * @param client an instance of a Discord.js client
 * @param match a resolvable type to match
 * @param predicate an optional predicate to manually match
 */
export const getVoiceConnection = (client: Client, match: GuildResolvable | ChannelResolvable, predicate?: (connection: VoiceConnection) => boolean) => {
    if (predicate) return client.voice.connections.find(predicate);

    let type = null;
    if (match instanceof Guild || match instanceof VoiceChannel) {
        type = match instanceof Guild
            ? VoiceConnectionMatchType.GUILD
            : VoiceConnectionMatchType.CHANNEL
        match = match.id
    }
    
    if (!type) throw new Error('`match` parameter must be a guild or voice channel resolvable type.');

    return client.voice.connections.find(connection =>
        type === VoiceConnectionMatchType.GUILD 
            ? connection.channel.guild.id === match
            : connection.channel.id === match);
}

/**
 * Attempts to determine the change
 * in two voice states and return
 * an enum constant representing it.
 * 
 * @param a the previous voice state
 * @param b the current voice state
 */
export const determineVoiceStateChange = (a: VoiceState, b: VoiceState) => {
    if (!a.channel && b.channel)
        return VoiceStateChange.CONNECT;
    
    if (a.channel && !b.channel)
        return VoiceStateChange.DISCONNECT;
    
    if (!a.deaf && b.deaf)
        return VoiceStateChange.DEAF;
    
    if (!a.mute && b.mute)
        return VoiceStateChange.MUTE;
    
    if (a.deaf && !b.deaf)
        return VoiceStateChange.UNDEAF;
    
    if (a.mute && !b.mute)
        return VoiceStateChange.UNMUTE;

    if (!a.serverDeaf && b.serverDeaf)
        return VoiceStateChange.SERVER_DEAF;

    if (a.serverDeaf && !b.serverDeaf)
        return VoiceStateChange.SERVER_UNDEAF;

    if (!a.serverMute && b.serverMute)
        return VoiceStateChange.SERVER_MUTE;

    if (a.serverMute && !b.serverMute)
        return VoiceStateChange.SERVER_UNMUTE;

    if (a.serverMute && !b.serverMute)
        return VoiceStateChange.STREAM;

    if (a.streaming && !b.streaming)
        return VoiceStateChange.STREAM_STOP;

    return VoiceStateChange.UNKNOWN;
}

/**
 * Returns whether or not there is a user
 * alone in a given voice channel.
 * 
 * @param source the source channel or state
 */
export const isAloneInVC = (source: VoiceState | VoiceChannel) => {
    if (source instanceof VoiceState)
        source = source.channel;

    return source.members.size === 1;
}

/**
 * Returns the user, if they exist, that is
 * alone in a given voice channel.
 * 
 * @param source the source channel or state
 */
export const whoIsAloneInVC = (source: VoiceState | VoiceChannel) => {
    if (!isAloneInVC(source))
        return null;

    if (source instanceof VoiceState)
        source = source.channel;

    return source.members.array()[0].user;
}

/**
 * Attempts to find a user by a mention, or by
 * their snowflake ID from a given message.
 * 
 * @param message the message related to this query
 * @param input the user input to query for
 * @param def the fallback user in case the input is invalid
 */
export const findUser = async (message: Message, input: string, def: User) => {
    let target: User = def;
    if (input) {
        let client = input;
        let temp = null;
        if (isSnowflake(client)) {
            temp = await message.client.users.fetch(client);
        }

        if (isUserMention(client)) {
            let id = client.slice(3, client.length - 1);
            temp = await message.client.users.fetch(id);
        }

        target = temp;
    }

    if (!target && def) {
        return def;
    }

    return target;
}

/**
 * Attempts to join a voice channel and stream
 * the specified data according to the preferences
 * object supplied to this function.
 * 
 * @param channel the voice channel to join
 * @param prefs preferences for the audio stream
 */
export const streamAudio = (channel: VoiceChannel, prefs: VoiceConnectionPrefs) =>
    channel
        .join()
        .then(async connection => {
            if (prefs.onConnect)
                prefs.onConnect(channel);

            let dispatcher = connection.play(prefs.source, prefs.stream);
            
            dispatcher.on('finish', () => {
                if (!prefs.onFinish) 
                    return channel.leave();
                
                prefs.onFinish(channel);
            });

            dispatcher.on('error', err => {
                if (!prefs.onError)
                    return console.error(err);
                
                prefs.onError(channel, err);
            });
        })
        .catch(err => {
            if (!prefs.onError) {
                console.error(err);
                return channel.leave();
            }

            prefs.onError(channel, err);
        });

/**
 * Blocks all I/O for the
 * specified millisecond duration.
 * 
 * @param ms millis to sleep
 */
export const sleep = async (ms: number) => new Promise(resolve => {
    setTimeout(resolve, ms);
});

/**
 * Creates a message loader and returns it.
 * 
 * @param message the command message
 * @param emote an optional loader emote
 * @param prompt an optional loader prompt
 */
export const startLoader = async (message: Message, emote?: string, prompt?: string): Promise<MessageLoader> => {
    let loader = await message.reply(`${emote || LOADER} ${prompt || 'Working on that..'}`);
    return {
        message: loader,
        start: Date.now()
    };
}

/**
 * Destroys a message loader and returns
 * the time it took to load.
 * 
 * @param loader the message loader
 */
export const endLoader = async (loader: MessageLoader) => {
    await loader.message.delete();
    return { timeDiff: parseInt((Date.now() - loader.start).toFixed(2)) };
}

/**
 * Replaces all occurances of a given
 * search string within another string.
 * 
 * @param input the input string
 * @param search the string to replace
 * @param replace what to replace it with
 */
export const replaceAll = (input: string, search: string | RegExp, replace: string) => {
    let copy = String(input);
    if (search instanceof RegExp) {
        if (!search.test(copy))
            return copy;

        while (search.test(copy))
            copy = copy.replace(search, replace);

        return copy;
    }

    if (!copy.includes(search))
        return copy;

    while (copy.includes(search))
        copy = copy.replace(search, replace);

    return copy;
}

/**
 * Performs a series of replacements on
 * a given string.
 * 
 * @param input the input string
 * @param replacements the replacements to make
 */
export const replace = (input: string, replacements: SearchAndReplace[]) => {
    let temp = input.slice();
    for (let { search, replacement, useRegularReplace } of replacements) {
        if (!useRegularReplace) {
            temp = replaceAll(temp, search, replacement);
            continue;
        }

        temp = temp.replace(search, replacement);
    }

    return temp;
}

export interface PermissionAddons extends PermissionFlags {
    SUPER_PERMS: number;
}

export const CustomPermissions: PermissionAddons = Permissions.FLAGS as PermissionAddons;
CustomPermissions.SUPER_PERMS = 100000

/**
 * Retrieves the formatted duration string
 * for the given millis duration input.
 * 
 * @param time the time in milliseconds
 */
export const getLatestTimeValue = (time: number) => {
    let sec = Math.trunc(time / 1000) % 60;
    let min = Math.trunc(time / 60000 % 60);
    let hrs = Math.trunc(time / 3600000 % 24);
    let days = Math.trunc(time / 86400000 % 30.4368);
    let mon = Math.trunc(time / 2.6297424E9 % 12.0);
    let yrs = Math.trunc(time / 3.15569088E10);

    let y = `${yrs}y`;
    let mo = `${mon}mo`;
    let d = `${days}d`;
    let h = `${hrs}h`;
    let m = `${min}m`;
    let s = `${sec}s`;

    let result = '';
    if (yrs !== 0) result += `${y}, `;
    if (mon !== 0) result += `${mo}, `;
    if (days !== 0) result += `${d}, `;
    if (hrs !== 0) result += `${h}, `;
    if (min !== 0) result += `${m}, `;
    
    result = result.substring(0, Math.max(0, result.length - 2));
    if ((yrs !== 0 || mon !== 0 || days !== 0 || min !== 0 || hrs !== 0) && sec !== 0) {
        result += ', ' + s;
    }

    if (yrs === 0 && mon === 0 && days === 0 && hrs === 0 && min === 0) {
        result += s;
    }

    return result.trim();
}

/**
 * Retrieves all components of the duration
 * for the provided time input.
 * 
 * @param time the time in milliseconds
 */
export const getTimeComponents = (time: number) => {
    let sec = Math.trunc(time / 1000) % 60;
    let min = Math.trunc(time / 60000 % 60);
    let hrs = Math.trunc(time / 3600000 % 24);
    let days = Math.trunc(time / 86400000 % 30.4368);
    let mon = Math.trunc(time / 2.6297424E9 % 12.0);
    let yrs = Math.trunc(time / 3.15569088E10);

    return {
        seconds: sec,
        minutes: min,
        hours: hrs,
        days,
        months: mon,
        years: yrs
    }
}

/**
 * Generates a change string for stock prices.
 * 
 * @param input the input value
 * @param seperator the seperator to place between the prepended +/- and the value
 * @param digits the amount of digits to fix the resulting value to
 * @param prependPlus whether or not to prepend a plus sign if the change is positive
 */
export const getChangeString = (input: string | number, seperator: string, digits: number, prependPlus?: boolean) => {
    return (Number(input) > 0 
        ? prependPlus 
            ? '+' 
            : '' 
        : '-') 
        + seperator 
        + Math
            .abs(Number(input))
            .toFixed(digits);
}

/**
 * Returns the indicator emote for a given value.
 * 
 * @param indicator the indicator value
 * @param upThreshold the threshold for an upwards arrow to appear
 * @param downThreshold the threshold for a downwards arrow to appear
 * @param stagnent the threshold for a stagnant arrow to appear
 */
export const getArrowEmoteForData = (indicator: number | string, upThreshold: number, downThreshold: number, stagnent: number) => {
    if (indicator === stagnent) return ':arrow_right:';
    if (indicator > upThreshold) return ':arrow_upper_right:';
    if (indicator < downThreshold) return ':arrow_lower_left:';

    return ':twisted_rightwards_arrows:';
}

/**
 * Returns a word form of a provided
 * number. Useful for number emotes.
 * 
 * @param num the number to convert
 * @see https://gist.github.com/ForbesLindesay/5467742
 */
export const toWords = (num: number) => {
    let ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
                'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
                'seventeen', 'eighteen', 'nineteen'];

    let tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty',
                'ninety'];
  
    let numString = num.toString();
    if (num < 0) return null;
    if (num === 0) return 'zero';
  
    //the case of 1 - 20
    if (num < 20) {
        return ones[num];
    }
  
    if (numString.length === 2) {
        return tens[numString[0]] + ' ' + ones[numString[1]];
    }
  
    //100 and more
    if (numString.length == 3) {
        if (numString[1] === '0' && numString[2] === '0')
            return ones[numString[0]] + ' hundred';
        else
            return ones[numString[0]] + ' hundred and ' + toWords(+(numString[1] + numString[2]));
    }
  
    if (numString.length === 4) {
        var end = +(numString[1] + numString[2] + numString[3]);
        if (end === 0) return ones[numString[0]] + ' thousand';
        if (end < 100) return ones[numString[0]] + ' thousand and ' + toWords(end);
        return ones[numString[0]] + ' thousand ' + toWords(end);
    }
}

/**
 * Returns a number and it's appropriate suffix
 * appended to the end of the string.
 * 
 * @param i the number to convert
 */
export const ordinalSuffix = (i: number) => {
    let j = i % 10,
        k = i % 100;

    if (j == 1 && k != 11) return `${i}st`;
    if (j == 2 && k != 12) return `${i}nd`;
    if (j == 3 && k != 13) return `${i}rd`;
    
    return `${i}th`;
}

/**
 * Creates a joined string from a list of objects.
 * 
 * @param list a list of elements of type U
 * @param delimiter the delimiter for the joined elements
 * @param apply applies the given function to each element of the list
 */
export const join = <U, T>(list: U[], delimiter: string, apply: (val: U) => T) => {
    let str = '';
    list
        .map(apply)
        .forEach((range, i) => {
            str += range + (i === list.length - 1 ? '' : delimiter);
        });
    
    return str;
}

/**
 * Returns the amount of elements matching a given
 * predicate in a provided list of elements of type U.
 * 
 * @param list the list of elements of type U
 * @param predicate the predicate to sum types of U
 */
export const count = <U>(list: U[], predicate: (val: U) => boolean) => {
    return list
        .filter(predicate)
        .length;
}

/**
 * Returns a sum of elements converted to numbers
 * from a provided list of elements of type U.
 * 
 * @param list the list of elements of type U
 * @param apply how to convert the list of U to numbers
 */
export const sum = <U>(list: U[], apply: (val: U) => number) => {
    return list
        .map(apply)
        .reduce((prev, cur) => cur + prev, 0);
}

/**
 * Extracts a valid expiration date out of a
 * user-provided expiration date for a contract.
 * 
 * @param input the inputted contract expiry date
 */
export const getExpDate = (input: string): Date => {
    // checks if its MM/DD without year
    if (conforms(/^\d{1,2}\/\d{1,2}$/, input)) {
        input += '/' + moment(Date.now()).format('YYYY');
    }

    let customDate: any = moment(new Date(input), false);
    if (customDate._d === 'Invalid Date'
        || customDate._d === 'Invalid date') {
        return null;
    }

    return customDate._d;
}

/**
 * Attempts to retrieve the closest date
 * to the inputted value from a given list.
 * 
 * @param input the inputted date
 * @param valid a list of valid dates
 */
export const getClosestDate = (input: Date, valid: Date[]) => {
    return valid.reduce((prev, cur) => (Math.abs(cur.getTime() - input.getTime()) < Math.abs(prev.getTime() - input.getTime())) ? cur : prev);
}

/**
 * Returns the closest matches of the
 * provided valid string array, to the
 * given input string.
 * 
 * @param input the input string
 * @param valid a list of valid strings
 * @param limit the limit of results to return
 */
export const getClosestMatches = (input: string, valid: string[], limit?: number) => {
    let results = valid
        .map(record => {
            return {
                input,
                valid: record,
                score: getJWDistance(input, record)
            }
        })
        .sort((a, b) => b.score - a.score);

    if (limit) {
        results = results.slice(0, Math.min(results.length, limit));
    }

    return results;
}

/**
 * Applies the Jaro-Winkler algorithm
 * to determine the simularity of two
 * strings.
 * 
 * @param input the input string
 * @param valid the valid string
 * @see https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance
 */
export const getJWDistance = (input: string, valid: string) => {
    let m = 0;
    let i, j;

    if (input.length === 0 || valid.length === 0) {
        return 0;
    }

    input = input.toUpperCase();
    valid = valid.toUpperCase();

    if (input === valid) {
        return 1;
    }

    let range = (Math.floor(Math.max(input.length, valid.length) / 2)) - 1;
    let inputMatches = new Array(input.length);
    let validMatches = new Array(valid.length);

    for (let i = 0; i < input.length; i++) {
        let low = (i >= range) ? i - range : 0;
        let high = (i + range <= (valid.length - 1)) ? (i + range) : (valid.length - 1);
        for (let j = low; j <= high; j++) {
            if (inputMatches[i] !== true && validMatches[j] !== true && inputMatches[i] === validMatches[j]) {
                ++m;
                inputMatches[i] = validMatches[j] = true;
                break;
            }
        }
    }

    let k = 0;
    let num = 0;

    for (let i = 0; i < input.length; i++) {
        if (inputMatches[i] === true) {
            for (let j = k; j < valid.length; j++) {
                if (validMatches[j] === true) {
                    k = j + i;
                    break;
                }

                if (input[i] !== valid[j]) {
                    ++num;
                }
            }
        }
    }

    let weight = (m / input.length + m / valid.length + (m - (num / 2)) / m) / 3;
    let l = 0;
    let p = 0.1;

    if (weight > 0.7) {
        while (input[l] === valid[l] && l < 4) {
            ++l;
        }

        weight = weight + l * p * (1 - weight);
    }

    return weight;
}

/**
 * Returns the highest clean divisor
 * of a given number, up to max.
 * 
 * (Yes, I know this could probably
 *  be implemented more efficiently
 *  but it's alright)
 * 
 * @param number the number
 * @param max the maximum number
 */
export const getHighestDivisor = (number: number, max: number = number) => {
    let highest = 0;
    for (let i = 0; i < max; i++) {
        if (number % i === 0) {
            highest = i;
        }
    }

    return highest;
}

/**
 * Returns a list of clean divisors
 * of a given number, up to max.
 * 
 * @param number the number
 * @param max the maximum number
 */
export const getDivisors = (number: number, max: number = number) => {
    let arr = [];
    for (let i = 0; i < max; i++) {
        if (number % i === 0) {
            arr.push(i);
        }
    }

    return arr;
}