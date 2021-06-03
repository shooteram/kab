import { parse } from './args';
import { load } from './options';
import { balance, tickerInformation, tradeBalance, tradesHistory } from './kraken';

(async () => {
    await parse();
    await load();

    const curr = 'EUR';
    let money: number = 0;

    await tradeBalance().then(balance => { money = parseFloat(balance.eb) });

    await balance()
        .then(async value => {
            await Promise.all(
                Object.keys(value).map(async asset => {
                    if (asset.indexOf('.S') > 0) {
                        let pair = `${asset.substring(0, asset.length - 2)}${curr}`;

                        await tickerInformation({ pair })
                            .then(ticker => {
                                money += parseFloat(ticker[pair].c[0]) * parseFloat(value[asset]);
                                Promise.resolve('ok');
                            });
                    }
                })
            );
        });

    await tradesHistory().then(trades => { trades.map(trade => { money -= trade.cost }) });

    process.stdout.write(`${money >= 0 ? 'won' : 'lost'} ${Math.abs(money).toFixed(2)}€\n`);
})();
