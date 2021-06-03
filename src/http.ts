import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { createHash, createHmac } from 'crypto';
import { ClientRequest } from 'http';
import { stringify } from 'querystring';
import { errorDescription } from './kraken';
import { config } from './options';

/**
 * HMAC-sha512 of (uri path + sha256(nonce + post data)) and base64 decoded secret api key
 * https://docs.kraken.com/rest/#section/Authentication/Headers-and-Signature
 */
const signature = (path: string, data: string, nonce: number): string => {
    return createHmac('sha512', Buffer.from(config.api.secret as string, 'base64'))
        .update(path + createHash('sha256').update(nonce + data).digest('binary' as 'base64'), 'binary')
        .digest('base64');
}

const http: AxiosInstance = axios.create({
    baseURL: 'https://api.kraken.com',
    timeout: 1000,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' },
});

http.interceptors.request.use((aconfig: AxiosRequestConfig): AxiosRequestConfig => {
    let url: string = aconfig.url as string;

    if (url.indexOf('/public/') > 0) {
        aconfig.method = 'GET';
        aconfig.params = aconfig.data;
    } else {
        let nonce = (new Date()).getTime();
        aconfig.data = stringify({ nonce, ...aconfig.data });

        aconfig.headers = {
            ...aconfig.headers,
            'API-Key': config.api.key,
            'API-Sign': signature(aconfig.url as string, aconfig.data, nonce),
        };
    }

    aconfig.headers = {
        ...aconfig.headers,
        'User-Agent': config.http.user_agent,
    }

    return aconfig;
});

http.interceptors.response.use(
    response => {
        if (response.data.error.length > 0) {
            let r = response.request as ClientRequest;
            return Promise.reject(`> ${r.method} | ${r.protocol}//${r.host}${r.path}\nerror: ${errorDescription(response.data.error)}`);
        }

        return response;
    },
    (error: Error) => { Promise.reject(error); },
);

export { http };
