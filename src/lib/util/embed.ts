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

import { IvyEngine } from '../engine';

import {
    DMChannel,
    EmbedFieldData,
    GuildChannel,
    Message,
    MessageEmbed,
    TextChannel
} from 'discord.js';

export class EmbedBuilder {

    constructor(private engine: IvyEngine) {}

    /**
     * Builds a stylized embed.
     * 
     * @param title     the title of the embed
     * @param icon      the icon url for the embed
     * @param message   the message body for the embed
     * @param fields    [optional] a list of fields to display
     * @param metadata  [optional] a message object to add metadata from
     * @param image     [optional] an image to display under the embed
     * @param thumbnail [optional] a thumbnail to display in the embed
     */
    build = (title: string, icon: string, message: string, fields?: EmbedFieldData[], metadata?: Message, image?: string, thumbnail?: string) => {
        let embed = new MessageEmbed()
            .setAuthor(title, icon)
            .setColor(this.engine.opts.color)
            .setDescription(message)
            .addFields(fields || [])
            .setImage(image || undefined)
            .setThumbnail(thumbnail || undefined);

        if (metadata) {
            let channelName = metadata instanceof GuildChannel
                ? '#' + (metadata as TextChannel).name 
                : metadata instanceof DMChannel 
                    ? '@' + (metadata as DMChannel).recipient.username 
                    : 'unknown';
            
            embed = embed
                .setFooter(`${metadata.member.displayName} in ${channelName}`, metadata.author.avatarURL())
                .setTimestamp();
        }

        return embed;
    }

}