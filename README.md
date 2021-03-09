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

import { Client, Guild } from 'discord.js';
import { Colors, GuildDataProvider, GuildTokenLike, IvyEngine, Logger, StartupRunnable } from '.';

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
            color: '0xFF9800',                  // a hex code that should be used for embed coloring and such (0x<hex-code>)
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
    
    load(guild: Guild): CustomGuildToken {
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
    
    save(guild: Guild, data: CustomGuildToken): void {
        // save to SQL, or wherever else
    }

}

type CustomGuildToken = GuildTokenLike & {
    games: {
        category: string;
        feed: string;
        max: number;
    }
}

class StartupHandler implements StartupRunnable {
    run(engine: IvyEngine) {
        let logger: Logger = new Logger();
        logger.unlisted(`Booting ${logger.wrap(Colors.GREEN, 'Stonks')} version ${logger.wrap(Colors.DIM, '0.1 (master)')}`);
        logger.unlisted(`ILEFA Labs (c) ${moment().format('YYYY')}`);
        logger.unlisted(``);
    }
}

new StonksBot();
```

## Ivy Engine Preferences
| Parameter              | What is it                                                                       |
| -----------            | -----------                                                                      |
| ``token``              | your bot token from the discord developer portal  |
| ``name``               | the name of your bot, so it can be referred to in logs, and other internal settings |
| ``logger``             | an ivy logger instance, with customizations if desired |
| ``gitRepo``            | if you would like version tracking (the ability for the bot to know it's current git version/branch), you can enter it's repo name in the following format: ``name/repo``, such as ``ilefa/ivy`` |
| ``superPerms``         | an array of discord snowflakes ids corresponding to users that will have full privileges for the bot, regardless of set permissions in commands |
| ``reportErrors``       | an array of discord snowflakes ids corresponding to servers in which the bot will display verbose information on command errors |
| ``color``              | a color code (0x<hex-code>) that will be reflected in embeds created by ivy utilities |
| ``provider``           | an ivy guild data provider instance, which will allow ivy to save and load guild data of your choosing for internal systems |
| ``startup``            | an instance of a runnable that will be called upon startup; feel free to place watermarks or other cool things the bot will display or do on startup |
| ``eventHandler``       | an instance of an event handler that will process events for the bot, such as messages, reactions, and errors |
| ``presence``           | a standard discord.js [presence data](https://discord.js.org/#/docs/main/stable/typedef/PresenceData) object |
| ``discord``            | a standard discord.js [client options](https://discord.js.org/#/docs/main/stable/typedef/ClientOptions) object |  

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[GPL-3.0](https://choosealicense.com/licenses/gpl-3.0/)