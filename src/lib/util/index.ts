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

import { Units } from 'parse-duration';
import { PaginatedEmbed } from './paginator';
import {
    Client,
    EmbedFieldData,
    Emoji,
    Message,
    MessageEmbed,
    Permissions,
    PermissionFlags,
    User,
    Role,
    TextChannel
} from 'discord.js';

export { PaginatedEmbed };

export const LOADER = '<a:loading:788890776444207194>';
export const LOOKING = '<a:looking:807057053713039420>';
export const FC = '<:FC:786296825115443280>';
export const JOIN_BUTTON = '<:join:798763992813928469>';
export const RED_CIRCLE = '<:dnd:808585033991585802>';
export const YELLOW_CIRCLE = '<:idle:808585033908224010>';
export const GREEN_CIRCLE = '<:online:808585033899966464>';
export const GRAY_CIRCLE = '<:offline:808585033890791424>';

export const SNOWFLAKE_REGEX = /^\d{18,}$/;
export const EMOTE_REGEX = /<(a|):\w+:\d{18,}>/;
export const USER_MENTION_REGEX = /^<@\!\d{18,}>$/;

export const URL_REGEX = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;

export type MessageLoader = {
    message: Message;
    start: number;
}

export const DAY_MILLIS = 86400000;
export const bold = (message: any) => `**${message}**`;
export const italic = (message: any) => `*${message}*`;
export const emboss = (message: any) => `\`\`${message}\`\``;
export const numberEnding = (num: number) => num === 1 ? '' : 's';
export const cond = (cond: boolean, t: string, f: string) => cond ? t : f;
export const link = (display: string, link: string) => `[${display}](${link})`;
export const timeDiff = (start: number) => (Date.now() - start).toFixed(2);
export const conforms = (regex: RegExp, target: string) => regex.test(target);
export const codeBlock = (lang: string, message: any) => `\`\`\`${lang}\n${message}\`\`\``;
export const asEmote = (emote: Emoji) => `<${emote.animated ? 'a' : ''}:${emote.name}:${emote.id}>`;
export const asMention = (user: User | string) => `<@${user instanceof User ? user.id : user}>`;
export const resolveEmote = (client: Client, id: string) => client.emojis.cache.get(id);
export const mentionChannel = (id: string) => `<#${id}>`;
export const mentionRole = (role: Role | string) => `<@&${role instanceof Role ? role.id : role}>`;
export const getDuration = (input: string) => df(input, 's');
export const getDurationWithUnit = (input: string, unit: Units) => df(input, unit);
export const capitalizeFirst = (input: string) => input
    .split(' ')
    .map(str => str.charAt(0).toUpperCase() + str.slice(1))
    .join('');


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
        if (SNOWFLAKE_REGEX.test(client)) {
            temp = await message.client.users.fetch(client);
        }

        if (USER_MENTION_REGEX.test(client)) {
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
 * Blocks all I/O for the
 * specified millisecond duration.
 * 
 * @param ms millis to sleep
 */
export const sleep = async ms => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

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
export const replaceAll = (input: string, search: string, replace: string) => {
    let copy = String(input);
    if (!copy.includes(search)) {
        return copy;
    }

    while (copy.includes(search)) {
        copy = copy.replace(search, replace);
    }

    return copy;
}

export interface PermissionAddons extends PermissionFlags {
    SUPERMAN: number;
}

export const CUSTOM_PERMS: PermissionAddons = Permissions.FLAGS as PermissionAddons;
CUSTOM_PERMS.SUPERMAN = 100000

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
export const getEmoteForIndicator = (indicator: number | string, upThreshold: number, downThreshold: number, stagnent: number) => {
    if (indicator === stagnent) return ':arrow_right:';
    if (indicator > upThreshold) return ':arrow_upper_right:';
    if (indicator < downThreshold) return ':arrow_lower_left:';

    return ':twisted_rightwards_arrows:';
}

/**
 * Returns the arrow emote for a given EPS value.
 * @param eps the eps value for a stock
 */
export const getEmoteForEPS = (eps: number | string) => getEmoteForIndicator(eps, 0, 0, 0);

/**
 * Returns an emote for the XP placement leaderboard.
 * @param placement the xp placement
 */
export const getEmoteForPlacement = (placement: number) => {
    if (placement == 1) return ':first_place:';
    if (placement == 2) return ':second_place:';
    if (placement == 3) return ':third_place:';
    if (placement == 10) return ':keycap_ten:';
    if (placement > 10) return '';

    return `:${toWords(placement)}:`;
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
export const count = <U, T>(list: U[], predicate: (val: U) => boolean) => {
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

export const addCommandMetadata = (message: Message, embed: MessageEmbed) => {
    return embed
        .setFooter(`${message.member.displayName} in #${(message.channel as TextChannel).name}`, message.author.avatarURL())
        .setTimestamp();
}

/**
 * Shorthand for generating a simple message embed.
 * 
 * @param title the title of the embed
 * @param icon the embed icon
 * @param message the description for the embed
 */
export const generateSimpleEmbed = (title: string, icon: string, message: string) => {
    return new MessageEmbed()
        .setAuthor(title, icon)
        .setColor(0x9B59B6)
        .setDescription(message);
}

/**
 * Shorthand for generating a simple message embed.
 * 
 * @param title the title of the embed
 * @param icon the embed icon
 * @param message the description for the embed
 * @param image the thumbnail for the embed
 */
export const generateSimpleEmbedWithThumbnail = (title: string,
                                                 icon: string,
                                                 message: string,
                                                 image: string) => {
    return generateSimpleEmbed(title, icon, message)
        .setThumbnail(image);
}

/**
 * Shorthand for generating a simple message embed.
 * 
 * @param title the title of the embed
 * @param icon the embed icon
 * @param message the description for the embed
 * @param image the thumbnail for the embed
 */
export const generateSimpleEmbedWithImage = (title: string,
                                             icon: string,
                                             message: string,
                                             image: string) => {
    return generateSimpleEmbed(title, icon, message)
        .setImage(image);
}

/**
 * Shorthand for generating a simple message embed.
 * 
 * @param title the title of the embed
 * @param icon the embed icon
 * @param message the description for the embed
 * @param image the image for the embed
 * @param thumbnail the thumbnail for the embed
 */
export const generateSimpleEmbedWithImageAndThumbnail = (title: string,
                                                         icon: string,
                                                         message: string,
                                                         image: string,
                                                         thumbnail: string) => {
    return generateSimpleEmbed(title, icon, message)
        .setImage(image)
        .setThumbnail(thumbnail);
}

/**
 * Shorthand for generating a complex message embed.
 * 
 * @param title the title of the embed
 * @param icon the embed icon
 * @param message the description for the embed
 * @param fields a list of EmbedFieldData for the embed
 */
export const generateEmbed = (title: string,
                              icon: string,
                              message: string,
                              fields: EmbedFieldData[]) => {
    return generateSimpleEmbed(title, icon, message)
        .addFields(fields);
}

/**
 * Shorthand for generating a complex message embed.
 * 
 * @param title the title of the embed
 * @param icon the embed icon
 * @param message the description for the embed
 * @param fields a list of EmbedFieldData for the embed
 * @param thumbnail the thumbnail for the embed
 */
export const generateEmbedWithFieldsAndThumbnail = (title: string,
                                                    icon: string,
                                                    message: string,
                                                    fields: EmbedFieldData[],
                                                    thumbnail: string) => {
    return generateSimpleEmbed(title, icon, message)
        .addFields(fields)
        .setThumbnail(thumbnail);
}

/**
 * Shorthand for generating a complex message embed.
 * 
 * @param title the title of the embed
 * @param icon the embed icon
 * @param message the description for the embed
 * @param fields a list of EmbedFieldData for the embed
 * @param image the image for the embed
 */
export const generateEmbedWithFieldsAndImage = (title: string,
                                                icon: string,
                                                message: string,
                                                fields: EmbedFieldData[],
                                                image: string) => {
    return generateSimpleEmbed(title, icon, message)
        .addFields(fields)
        .setImage(image);
}

/**
 * Extracts a valid expiration date out of a
 * user-provided expiration date for a contract.
 * 
 * @param input the inputted contract expiry date
 */
export const getExpDate = (input: string): Date => {
    // checks if its MM/DD without year
    if (/^\d{1,2}\/\d{1,2}$/.test(input)) {
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