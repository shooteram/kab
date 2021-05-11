import { colors } from "./colors";
import { http } from "./http";

interface LooseErrorObject {
    [key: string]: string
}

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
    message += `\nhttps://www.google.com/search?q=${encodeURI(`site:https://support.kraken.com "${error}"`)}`;

    return message;
}

const fetch = (uri: string, data: object = {}): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        await http.post(uri, data)
            .then(value => { resolve(value.data) })
            .catch(reason => { reject(reason) });
    });
}

interface iBalance {
    ZEUR: string,
    XXBT: string,
    XXDG: string,
    XETH: string,
    BCH: string,
    ADA: string,
    QTUM: string,
    XTZ: string,
    'XTZ.S': string,
    TRX: string,
    KAVA: string,
    OXT: string,
    CRV: string,
    'KAVA.S': string,
    'ADA.S': string,
}

/**
 * Get Account Balance
 *
 * Retrieve all cash balances, net of pending withdrawals.
 */
const balance = (): Promise<iBalance> => {
    return new Promise(async (resolve, reject) => {
        await fetch('/0/private/Balance')
            .then(value => { resolve(value.result) })
            .catch(reason => { reject(reason) });
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

interface iAsset {
    asset: 'EUR' | 'USD',
}

/**
 * Get Trade Balance
 *
 * Retrieve a summary of collateral balances, margin position valuations, equity and margin level.
 */
const tradeBalance = (data: iAsset = { asset: 'EUR' }): Promise<iTradeBalance> => {
    return new Promise(async (resolve, reject) => {
        await fetch('/0/private/TradeBalance', data)
            .then(value => { resolve(value.result) })
            .catch(reason => { reject(reason) });
    });
}

export {
    errorDescription,
    balance,
    tradeBalance,
};
