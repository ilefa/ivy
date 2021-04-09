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

import TinyGradient from 'tinygradient';

import { generateEmbed } from '.';
import { Instance as TGInst } from 'tinygradient';

import {
    EmbedFieldData,
    Message,
    ReactionCollector,
    TextChannel,
    User
} from 'discord.js';

export type PageContent = {
    description: string,
    fields: EmbedFieldData[]
}

export class PaginatedEmbed {

    page: number;
    message: Message;
    collector: ReactionCollector;
    colorGradient: TGInst;

    constructor(public channel: TextChannel,
                public author: User,
                public title: string,
                public icon: string,
                public pages: PageContent[],
                public timeout: number = 600000,
                public thumbnail: string = null,
                public beginColor: string = 'black',
                public endColor: string = '#9b59b6') {

        this.page = 1;
        this.colorGradient = TinyGradient([beginColor, endColor]);

        channel
            .send(this.generatePage(this.page))
            .then(msg => this.init(msg));
    }

    static of(channel: TextChannel,
        author: User,
        title: string,
        icon: string,
        pages: PageContent[],
        timeout: number = 600000,
        thumbnail: string = null,
        beginColor: string = 'black',
        endColor: string = 'green'): PaginatedEmbed {
            return new PaginatedEmbed(channel, author, title, icon, pages, timeout, thumbnail, beginColor, endColor);
    }

    private generatePage(pnum: number) {
        let pind = pnum - 1;
        return generateEmbed(this.title, this.icon, this.pages[pind]?.description || '', this.pages[pind]?.fields || [])
                .setTimestamp()
                .setThumbnail(this.thumbnail)
                .setFooter(`Page ${pnum} of ${this.pages.length}`, this.channel.guild.iconURL())
                .setColor(this.getColor(pind));
    }

    private init(message: Message) {
        this.message = message;

        const filter = (reaction, user) => {
            if (user.bot) return false;
            return true;
        }

        if (this.pages.length === 1) {
            return;
        }

        this.collector = message.createReactionCollector(filter, { time: this.timeout });

        this.collector.on('collect', (reaction, user) => {
            if (this.functionMap.get(reaction.emoji.name)(this)) {
                this.message.edit(this.generatePage(this.page));
            }

            reaction.users.remove(user);
        });

        this.collector.on('end', () => {
            message.reactions.removeAll();
        })

        this.functionMap.forEach((_, emote) => {
            message.react(emote);
        });
    }

    private prevPage(ctx: PaginatedEmbed): boolean {
        if (ctx.page < 2) return false;
        ctx.page--;
        return true;
    }

    private nextPage(ctx: PaginatedEmbed): boolean {
        if (ctx.page >= ctx.pages.length) return false;
        ctx.page++;
        return true;
    }

    private firstPage(ctx: PaginatedEmbed): boolean {
        if (ctx.page === 1) return false;
        ctx.page = 1;
        return true;
    }

    private lastPage(ctx: PaginatedEmbed): boolean {
        if (ctx.page === ctx.pages.length) return false;
        ctx.page = ctx.pages.length;
        return true;
    }

    private functionMap: Map<string, (ctx: PaginatedEmbed) => boolean> = new Map([
        ['⬅️', this.firstPage],
        ['◀️', this.prevPage],
        ['▶️', this.nextPage],
        ['➡️', this.lastPage]
    ]);

    private getColor(index: number) {
        let val = index / ( this.pages.length - 1);
        return this.colorGradient.rgbAt(val).toHexString();
    }

}

