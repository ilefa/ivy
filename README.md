# Ivy

Ivy is a TypeScript library that deals with the fundamentals of building a Discord.js-based bot.

## Installation

Use npm to install Ivy.

```bash
npm install ilefa/ivy
```

## Usage

```ts
import moment from 'moment';

import {
    Client,
    Guild
} from 'discord.js';

import {
    Colors,
    GuildDataProvider,
    GuildTokenLike,
    IvyEngine,
    Logger,
    StartupRunnable
} from 'ilefa/ivy';

export default class StonksBot extends IvyEngine {

    constructor() {
        super({
            token: 'xxxxxxxxxxxxxxxxxxxxxx',    // your bot's token
            name: 'Stonks',                     // your bot's name
            logger: new Logger(),
            gitRepo: 'ilefa/stonks',            // if you want version tracking, the [user]/[repo] of your bot's repo
            superPerms: [
                'xxxxxxxxxxxxxx'                // any users you want to have all privileges
            ],
            reportErrors: [
                'xxxxxxxxxxxxxx'                // any servers in which verbose error details should be reported
            ],
            color: 0xFF9800,                    // a hex code that should be used for embed coloring and such (0x<hex-code>)
            provider: new DataProvider(),       // the guild data provider for this bot
            startup: new StartupHandler(),      // an optional instance of a runnable which is called on startup
            // eventHandler: new SomeHandler(), // an optional instance of an event handler that should be used
            // presence: { .. },                // a discord.js presence object, where you can specify status and rich presence
            // discord: { .. }                  // a discord.js client options object, where you can specify connection options
        });
    }

    // Called when everything is up and running
    onReady(client: Client) {
        this.logger.info('Stonks', 'All the stonks are going up.');
    }

    // You can register all of your commands in one place
    registerCommands() {}

    // Likewise, with modules, you can register them all here
    registerModules() {}

    // If you have any test flows, you can register them here
    registerFlows() {}

}

class DataProvider implements GuildDataProvider<CustomGuildToken> {
    
    async load(guild: Guild): Promise<CustomGuildToken> {
        // load from SQL, or wherever else
        return {
            prefix: '.',
            games: {
                category: 'xxxxxxxxxxxxxx',
                feed: 'xxxxxxxxxxxxxx',
                max: 5
            }
        }
    }
    
    async save(guild: Guild, data: CustomGuildToken): Promise<void> {
        // save to SQL, or wherever else
    }

}

// Define any per-server preferences here, such as feed channels, or restricted roles, or whatever you'd like
type CustomGuildToken = GuildTokenLike & {
    games: {
        category: string;
        feed: string;
        max: number;
    }
}

// Will be executed upon startup - maybe add some flashly watermark or something cool!
class StartupHandler implements StartupRunnable {
    run(engine: IvyEngine) {
        let logger: Logger = new Logger();
        logger.unlisted(`Booting ${logger.wrap(Colors.GREEN, 'Stonks')} version ${logger.wrap(Colors.DIM, '0.1 (master)')}`);
        logger.unlisted(`ILEFA Labs (c) ${moment().format('YYYY')}`);
        logger.unlisted(``);
    }
}

// Instantiate the Ivy-engine extended class, and Ivy will take care of the rest!
new StonksBot();
```

## Ivy Engine Preferences
| Parameter          |  Type                    |  What is it                                                                         |
| -----------        |  -----------             | -----------                                                                         |
| ``token``          | ``string``               | your bot token from the discord developer portal                                    |
| ``name``           | ``string``               | the name of your bot, so it can be referred to in logs, and other internal settings |
| ``logger``         | ``Logger``               | an ivy logger instance, with customizations if desired                              |
| ``gitRepo``        | ``string``               | if you would like version tracking (the ability for the bot to know it's current git version/branch), you can enter it's repo name in the following format: ``name/repo``, such as ``ilefa/ivy`` |
| ``superPerms``     | ``string[]``             | an array of discord snowflakes ids corresponding to users that will have full privileges for the bot, regardless of set permissions in commands |
| ``reportErrors``   | ``string[]``             | an array of discord snowflakes ids corresponding to servers in which the bot will display verbose information on command errors |
| ``color``          | ``string``               | a color code, either a hex number, or hex string that will be respected by embeds and other elements created by ivy utilities |
| ``provider``       | [GuildDataProvider<T>](src/lib/data/provider.ts)         | an ivy guild data provider instance, which will allow ivy to save and load guild data of your choosing for internal systems |
| ``startup``        | [StartupRunnable](src/lib/startup.ts)                    | an instance of a runnable that will be called upon startup; feel free to place watermarks or other cool things the bot will display or do on startup |
| ``eventHandler``   | [EventHandler](src/lib/module/modules/events.ts)         | an instance of an event handler that will process events for the bot, such as messages, reactions, and errors |
| ``presence``       | [PresenceData](https://discord.js.org/#/docs/main/stable/typedef/PresenceData)    | presence (status) information for the bot to respect                          |
| ``discord``        | [ClientOptions](https://discord.js.org/#/docs/main/stable/typedef/ClientOptions)  | custom discord api client options, such as sharding, privileged intents, etc. |  

## Per-Guild Data
Depending on what kind of project you are using this framework for, it may be required to store per-guild information such as prefixes, or some special channel IDs.

The GuildDataProvider API will give you a clean and structured way to handle this data. All you need to do is supply an instance of ``GuildDataProvider<P>``,
and define a type that will specify what the data per-guild will look like.

Let's suppose that a guild has to store information as to where certain logs should be sent - that would look something like this:
```ts
import { GuildDataProvider } from 'ilefa/ivy';

export type CustomGuildToken = GuildTokenLike & {
    logChannel: string; // let's store the channel ID as a string
    feedChannel: string; // and here, let's store another fictious channel's ID as a string
}

export default class DataProvider extends GuildDataProvider<CustomGuildToken> {

    async load(guild: Guild): Promise<CustomGuildToken> {
        // implement some logic of grabbing the token from a database of any sort
        let data = ...;

        return {
            // prefixes are required by GuildTokenLike, so if you want one constant prefix, just supply an unchanging string
            prefix: '.',
            logChannel: data.logChannel,
            feedChannel: data.feedChannel
        }
    }
    
    async save(guild: Guild, data: CustomGuildToken): Promise<void> {
        // implement some logic of saving the token to your database
    }

}

```

Additionally, you can use the included ``CachedGuildDataProvider`` to cache the results of guild tokens if you have a Redis database handy.
The implementation of the cached provider is quite similar as the default provider:

```ts
import { CachedGuildDataProvider } from 'ilefa/ivy';

// We will be utilizing the same CustomGuildToken as the previous example - so that's where this type comes from.
export default class DataProvider extends CachedGuildDataProvider<CustomGuildToken> {

    // Once load() is called, it will call fetch() in case the data is not available in the cache.
    async fetch(guild: Guild): Promise<CustomGuildToken> {
        // implement some logic of grabbing the token from a database of any sort
        let data = ...;

        return {
            // prefixes are required by GuildTokenLike, so if you want one constant prefix, just supply an unchanging string
            prefix: '.',
            logChannel: data.logChannel,
            feedChannel: data.feedChannel
        }
    }

    /**
     * Once this method is called, the cache will also be updated with the new data
     * You don't need to try to update the cache from within here.
     */
    async update(guild: Guild, data: CustomGuildToken): Promise<void> {
        // implement some logic of saving the token to your database
    }

}
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[GPL-3.0](https://choosealicense.com/licenses/gpl-3.0/)