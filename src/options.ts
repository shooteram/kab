import { mkdirSync, readFile, stat, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

interface iConfig {
    http: { user_agent: string | undefined },
    api: {
        key: string | undefined,
        secret: string | undefined,
    },
    db: { path: string },
}

let loaded: boolean = false;
var config: iConfig = {
    http: { user_agent: 'Kraken API Client' },
    api: { key: undefined, secret: undefined },
    db: { path: 'a.db' },
};

const dir: string = join(homedir(), '.config', 'kab'),
    path: string = join(dir, 'config.json');

const load = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (loaded) return resolve();

        stat(path, err => {
            if (err && "ENOENT" === err.code) {
                stat(dir, err => { if (err) mkdirSync(dir) });
                writeFileSync(path, JSON.stringify(config));
            }

            readFile(path, (err, data) => {
                if (err) return reject();

                try {
                    config = Object.assign(config, JSON.parse(data.toString()));
                    loaded = true;
                } catch (e) { return reject() }

                resolve();
            });
        });
    });
}

export { config, load };
