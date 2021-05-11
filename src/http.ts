import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { createHash, createHmac } from 'crypto';
import { ClientRequest } from 'http';
import { stringify } from 'querystring';
import { errorDescription } from './kraken';
import { config } from './options';

/**
 * HMAC-sha512 of (uri path + sha256(nonce + post data)) and base64 decoded secret api key
 *
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
    headers: {
        'User-Agent': config.http.user_agent,
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'API-Key': config.api.key,
    },
});

http.interceptors.request.use((aconfig: AxiosRequestConfig) => {
    let nonce = (new Date()).getTime();

    aconfig.data = stringify({ nonce, ...aconfig.data });
    aconfig.headers = {
        ...aconfig.headers,
        'API-Sign': signature(aconfig.url as string, aconfig.data, nonce),
    };

    return aconfig;
});

http.interceptors.response.use(
    response => {
        if (response.data.error.length > 0) {
            let r = response.request as ClientRequest;

            return Promise.reject(
                `> ${r.method} | ${r.protocol}//${r.host}${r.path}\n` +
                `error: ${errorDescription(response.data.error)}`
            );
        }

        return response;
    },
    error => Promise.reject(error.message),
);

export { http };
