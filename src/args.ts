import { argv } from 'process';

interface oArg {
    long: string,
    short?: string,
    required?: boolean,
};

interface pArg {
    name: string,
    value: string,
};

class Args {
    private args: Array<pArg>;

    constructor() {
        this.args = [];
    }

    public add(arg: pArg): void {
        this.args.push(arg);
    }

    public all(): Array<pArg> {
        return this.args;
    }

    public get(arg: string): string {

        return arg;
    }

    public find(argname: string): pArg | null {
        return this.args.find(v => argname === v.name) || null;
    }

    public has(argname: string): boolean {
        return undefined !== this.args.find(v => argname === v.name);
    }

    public default(key: string, _default: string): string {
        return this.has(key) ? (this.find(key)?.value as string) : _default;
    }
}

var args: Args = new Args;

const parse = async (pargs: Array<oArg>): Promise<Args> => {
    return new Promise((resolve, reject) => {
        let targs = argv.slice(2);

        pargs.map(arg => {
            let present: boolean = false;

            targs.map((value, index) => {
                let sarg: boolean = value.indexOf('-') === 0 && value.indexOf('--') !== 0,
                    larg: boolean = value.indexOf('--') === 0,
                    narg: string = targs[++index];

                if (sarg || larg) {
                    let carg = value.slice(sarg ? 1 : 2, value.length),
                        farg = (sarg ? arg.short : arg.long) === carg;

                    if (farg) {
                        present = true;

                        args.add({
                            name: arg.long,
                            value: undefined !== narg && 0 !== narg.indexOf('-') ? narg : String(true),
                        });
                    }
                }
            });

            if (arg.required && !present) {
                reject(new Error(`The argument "${arg.long}" is required.`));
            }
        });

        resolve(args);
    });
}

export { args, parse };
