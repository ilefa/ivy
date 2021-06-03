import { Guild } from 'discord.js';
import { GuildDataProvider, GuildTokenLike } from './provider';

export class DefaultGuildDataProvider implements GuildDataProvider<GuildTokenLike> {

    constructor(private prefix: string) {}

    load = async (_guild: Guild): Promise<GuildTokenLike> => {
        return {
            prefix: this.prefix
        }
    }
    
    save = (guild: Guild, data: GuildTokenLike) => {}

}