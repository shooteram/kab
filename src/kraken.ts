import { colors } from "./colors";
import { http } from "./http";

interface LooseErrorObject { [key: string]: string }

const errors: LooseErrorObject = {
    "EAPI:Invalid key": "An invalid API-Key header was supplied (see Authentication section)",
    "EAPI:Invalid nonce": "An invalid nonce was supplied (see Authentication section)",
    "EAPI:Invalid signature": "An invalid API-Sign header was supplied (see Authentication section)",
    "EGeneral:Invalid arguments": "The request payload is malformed, incorrect or ambiguous.",
    "EGeneral:Permission denied": "API key doesn't have permission to make this request.",
    "EOrder:Cannot open position": "User/tier is ineligible for margin trading",
    "EOrder:Insufficient funds": "Client does not have the necessary funds",
    "EOrder:Insufficient margin": "Exchange does not have available funds for this margin trade",
    "EOrder:Margin allowance exceeded": "User has exceeded their margin allowance",
    "EOrder:Margin level too low": "Client has insufficient equity or collateral",
    "EOrder:Order minimum not met": "Order size does not meet ordermin. (See AssetPairs endpoint.)",
    "EOrder:Orders limit exceeded": "(See Rate Limits section)",
    "EOrder:Positions limit exceeded": "",
    "EOrder:Rate limit exceeded": "(See Rate Limits section)",
    "EOrder:Unknown position": "",
    "EService:Market in cancel_only mode": "Request can't be made at this time. (See SystemStatus endpoint.)",
    "EService:Market in post_only mode": "Request can't be made at this time. (See SystemStatus endpoint.)",
    "EService:Unavailable": "The matching engine or API is offline",
}

const errorDescription = (error: string): string => {
    let message = error in errors ? `${errors[error]} (${error})` : error;
    message = `${colors.red}${message}${colors.white}`;
    return message += `\nhttps://www.google.com/search?q=${encodeURI(`site:https://support.kraken.com "${error}"`)}`;
}

const fetch = (uri: string, data: object = {}): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        await http.post(uri, data).then(value => { resolve(value.data) }).catch(reason => { reject(reason) });
    });
}

interface iBalance { [key: string]: string }

/**
 * Get Account Balance
 *
 * Retrieve all cash balances, net of pending withdrawals.
 */
const balance = (): Promise<iBalance> => {
    return new Promise(async (resolve, reject) => {
        await fetch('/0/private/Balance').then(value => { resolve(value.result) }).catch(reason => { reject(reason) });
    });
}

interface iTradeBalance {
    /** Equivalent balance (combined balance of all currencies) */
    eb: string,
    /** Trade balance (combined balance of all equity currencies) */
    tb: string,
    /** Margin amount of open positions */
    m: string,
    /** Unrealized net profit/loss of open positions */
    n: string,
    /** Cost basis of open positions */
    c: string,
    /** Current floating valuation of open positions */
    v: string,
    /** Equity: `trade balance + unrealized net profit/loss` */
    e: string,
    /** Free margin: `Equity - initial margin (maximum margin available to open new positions)` */
    mf: string,
    /** Margin level: `(equity / initial margin) * 100` */
    ml: string,
}

interface iAsset { asset: string }

/**
 * Get Trade Balance
 *
 * Retrieve a summary of collateral balances, margin position valuations, equity and margin level.
 */
const tradeBalance = (data: iAsset = { asset: 'EUR' }): Promise<iTradeBalance> => {
    return new Promise(async (resolve, reject) => {
        await fetch('/0/private/TradeBalance', data).then(value => { resolve(value.result) }).catch(reason => { reject(reason) });
    });
}

interface iTradeHistory {
    trades: {
        [key: string]: {
            /** Order responsible for execution of trade */
            ordertxid: string,
            /** Asset pair */
            pair: string,
            /** Unix timestamp of trade */
            time: number,
            /** Type of order (buy/sell) */
            type: string,
            /** Order type */
            ordertype: string,
            /** Average price order was executed at (quote currency) */
            price: string,
            /** Total cost of order (quote currency) */
            cost: string,
            /** Total fee (quote currency) */
            fee: string,
            /** Volume (base currency) */
            vol: string,
            /** Initial margin (quote currency) */
            margin: string,
            /**
             * Comma delimited list of miscellaneous info
             *   - _closing_, Trade closes all or part of a position
             */
            misc: string,
            /**
             * Position status (open/closed)
             *
             * _Only present if trade opened a position_
             */
            posstatus: string,
            /**
             * Average price of closed portion of position (quote currency)
             *
             * _Only present if trade opened a position_
             */
            cprice: any,
            /**
             * Total cost of closed portion of position (quote currency)
             *
             * _Only present if trade opened a position_
             */
            ccost: any,
            /**
             * Total fee of closed portion of position (quote currency)
             *
             * _Only present if trade opened a position_
             */
            cfee: any,
            /**
             * Total fee of closed portion of position (quote currency)
             *
             * _Only present if trade opened a position_
             */
            cvol: any,
            /**
             * Total margin freed in closed portion of position (quote currency)
             *
             * _Only present if trade opened a position_
             */
            cmargin: any,
            /**
             * Net profit/loss of closed portion of position (quote currency, quote currency scale)
             *
             * _Only present if trade opened a position_
             */
            net: any,
            /**
             * List of closing trades for position (if available)
             *
             * _Only present if trade opened a position_
             */
            trades: string[],
        },
    },
}

interface iTradeHistoryData {
    /** Type of trade */
    type?: 'all' | 'any position' | 'closed position' | 'closing position' | 'no position',
    /** Whether or not to include trades related to position in output */
    trades?: boolean,
    /** Starting unix timestamp or trade tx ID of results (exclusive) */
    start?: number,
    /** Ending unix timestamp or trade tx ID of results (inclusive) */
    end?: number,
    /** Result offset for pagination */
    ofs?: number,
}

interface iTrade {
    /** Asset pair */
    pair: string,
    /** Unix timestamp of trade */
    time: Date,
    /** Type of order (buy/sell) */
    type: string,
    /** Average price order was executed at (quote currency) */
    price: number,
    /** Total cost of order (quote currency) */
    cost: number,
    /** Total fee (quote currency) */
    fee: number,
    /** Volume (base currency) */
    vol: number,
    /** Initial margin (quote currency) */
    margin: number,
}

const tradesHistory = (data: iTradeHistoryData = {}): Promise<iTrade[]> => {
    return new Promise((resolve, reject) => {
        fetch('/0/private/TradesHistory', data)
            .then(value => {
                let tradeList: iTrade[] = [];
                Object.values((value.result as iTradeHistory).trades).map(trade => {
                    tradeList.push({
                        pair: trade.pair,
                        time: new Date(trade.time * 1000),
                        type: trade.type,
                        price: parseFloat(trade.price),
                        cost: parseFloat(trade.cost),
                        fee: parseFloat(trade.fee),
                        vol: parseFloat(trade.vol),
                        margin: parseFloat(trade.margin),
                    });
                });

                resolve(tradeList);
            })
            .catch(reason => { reject(reason) });
    });
}

interface iTickerQueryParameters {
    pair: string,
}

interface iTickerResponseScheme {
    [ke: string]: {
        /** Ask [price, whole lot volume, lot volume] */
        a: string[],
        /** Bid [price, whole lot volume, lot volume] */
        b: string[],
        /** Last trade closed [price, lot volume] */
        c: string[],
        /** Volume [today, last 24 hours] */
        v: string[],
        /** Volume weighted average price [today, last 24 hours] */
        p: string[],
        /** Number of trades [today, last 24 hours] */
        t: string[],
        /** Low [today, last 24 hours] */
        l: string[],
        /** High [today, last 24 hours] */
        h: string[],
        /** Today's opening price */
        o: string,
    },
}

const tickerInformation = (data: iTickerQueryParameters): Promise<iTickerResponseScheme> => {
    return new Promise((resolve, reject) => {
        fetch('/0/public/Ticker', data).then(value => { resolve(value.result) }).catch(reason => { reject(reason) });
    });
}

export { errorDescription, balance, tradeBalance, tradesHistory, tickerInformation };
