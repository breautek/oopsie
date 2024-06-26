
import { IOopsie, Oopsie, IOopsieCtor } from './Oopsie';
import {TSerializables} from '@breautek/serializer';

export class OopsieFactory {
    private static $instance: OopsieFactory;

    private $ctors: Map<string, IOopsieCtor<any>>;

    private constructor() {
        this.$ctors = new Map();
    }

    public static getInstance(): OopsieFactory {
        if (!OopsieFactory.$instance) {
            OopsieFactory.$instance = new OopsieFactory();
        }

        return OopsieFactory.$instance;
    }

    public registerOopsie(ctor: IOopsieCtor<any>): void {
        this.$ctors.set(ctor.prototype.constructor.name, ctor);
    }

    public create<TDetails extends TSerializables = TSerializables>(data: IOopsie<TDetails>): Oopsie<TDetails> {
        let ctor: IOopsieCtor<TDetails> | undefined = this.$ctors.get(data.name);

        if (!ctor) {
            if (data.name !== 'Oopsie') {
                console.warn(`Oopsie named "${data.name}" attempted to be created via OopsieFactory but ${data.name} is not registered.`);
                console.warn('Falling back to the base Oopsie class.');
            }
            ctor = <IOopsieCtor<TDetails>>Oopsie;
        }

        return new ctor(data.message, null, data.details);
    }
}
