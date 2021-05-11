import { Database } from 'sqlite3';
import { config } from './options';

var db: Database;

const init = (): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        await connect().catch(reason => reject(reason));
        await seed().catch(reason => reject(reason));
        await set().catch(reason => reject(reason));

        resolve();
    });
}

const connect = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        db = new Database(`${__dirname}/../${config.db.path}`, err => {
            if (err) reject(err.message);
            resolve();
        });
    });
}

const seed = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.exec('create table if not exists stats (id integer primary key, name text not null unique, value text not null);', err => {
            if (err) reject(err.message);
            resolve();
        });
    });
}

const set = (): Promise<void> => {
    return new Promise(resolve => {
        return resolve();

        // let selectsql = 'select name, value from stats where name = "nonce";',
        //     insertsql = 'insert into stats (name, value) values ("nonce", "0n");';

        // db.get(selectsql, (err, rows) => {
        //     if (err) reject(err.message);

        //     if (rows) {
        //         nonce = new Nonce(BigInt(parseInt(rows.value)));
        //         return resolve();
        //     }

        //     db.exec(insertsql, err => {
        //         if (err) reject(err.message);

        //         db.get(selectsql, (_, rows) => {
        //             nonce = new Nonce(BigInt(parseInt(rows.value)));
        //             return resolve();
        //         });
        //     });
        // });
    });
}

export { init };
