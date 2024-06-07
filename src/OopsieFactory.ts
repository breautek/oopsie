
import { IOopsie, Oopsie, IOopsieCtor } from './Oopsie';

export class OopsieFactory {
    private static $instance: OopsieFactory;

    private $ctors: Map<string, IOopsieCtor>;

    private constructor() {
        this.$ctors = new Map();
    }

    public static getInstance(): OopsieFactory {
        if (!OopsieFactory.$instance) {
            OopsieFactory.$instance = new OopsieFactory();
        }

        return OopsieFactory.$instance;
    }

    public registerOopsieConstructor(name: string, ctor: IOopsieCtor): void {
        this.$ctors.set(name, ctor);
    }

    public create(data: IOopsie): Oopsie {
        let ctor: IOopsieCtor | undefined = this.$ctors.get(data.name);

        if (!ctor) {
            ctor = Oopsie;
        }

        return new ctor(data.message, null, data.details);
    }
}
