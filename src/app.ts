import { parse } from './args';
import { balance, tradeBalance } from './kraken';
import { load } from './options';

(async () => {
    await parse([
        { short: 'n', long: 'nonce' },
        { short: 'k', long: 'apikey', required: true },
        { short: 's', long: 'apisecret', required: true },
        { short: 'a', long: 'useragent' },
    ])
        .catch((reason: Error) => {
            console.error(reason.message);
            process.exit(1);
        });

    await load();
    await balance().then(v => { console.log(v) });
    await tradeBalance().then(v => { console.log(v) });
})();
