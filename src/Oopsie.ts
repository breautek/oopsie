
import {
    TSerializables,
    ISerializable,
    TSerializable
} from '@breautek/serializer'
import dedent from 'dedent';

export interface IOopsieLocale {
    key: string;
    params: Record<string, string>;
}

interface _IOopsie<TDetails extends TSerializables = TSerializables> {
    name: string;
    message: string;
    stack: string;
    cause: _IOopsie | null;
    details: TDetails | null;
    locale: IOopsieLocale;
}

export type IOopsie<TDetails extends TSerializables = TSerializables> = TSerializable<_IOopsie<TDetails>>;

/**
 * An oopsie is an error class that is more structured.
 * 
 * It is an `Error`, therefore using the public fields like `name` and `message`
 * is available, as well as the `stack` field.
 * 
 * But an Oopsie can optionally hold 2 additional fields, a cause and other details.
 * 
 * A cause can be an Error, but if it's an Oopsie, it can have recursive causes.
 * Using the `getStack()` method will produce a full stacktrace including the
 * causes.
 * 
 * Details can be any serializable object supported by @breautek/serializer.
 * 
 * An Oopsie can be instantiated and used stand-alone, or it can be sub-classed.
 * Subclassing would be recommended to properly type the details object.
 * 
 * The message field is highly recommended to use a meaningful message for
 * developers. If building an error for end-user feedback, consider making a
 * subclass and implement getLocaleKey/getLocaleParams for locale support as
 * well as using the details for user-facing data.
 * 
 * When subclassing, avoid attaching state outside of the details unless if that
 * state should be private data, otherwise Oopsie's cannot be created properly
 * with the OopsieFactory.
 * 
 * When subclassing, the constructor signature must be kept in tact. All Oopsie
 * classes shall use the IOopsieCtor
 */
export class Oopsie<TDetails extends TSerializables = TSerializables> extends Error implements ISerializable<IOopsie<TDetails>> {
    private $cause: Error | null;
    private $details: TDetails | null;
    private $locale: IOopsieLocale;

    public constructor(message: string, cause?: Error | null, details?: TDetails | null) {
        super(message);

        this.$locale = {
            key: this.getLocaleKey(),
            params: this.getLocaleParams()
        };

        this.name = this.constructor.name;
        this.$cause = cause || null;
        this.$details = details || null;
    }

    public getLocaleKey(): string {
        return 'breautek/oopsie/not-defined';
    }

    public getLocaleParams(): Record<string, string> {
        return {};
    }

    public static is<T extends IOopsieCtor<TSerializables>>(errorClass: T, x: unknown): x is InstanceType<T> {
        return x instanceof errorClass;
    }

    public getCause(): Error | null {
        return this.$cause;
    }

    public getDetails(): TDetails | null {
        return this.$details;
    }

    private $serializeCause(): IOopsie | null {
        if (!this.$cause) {
            return null;
        }

        let cause: IOopsie | null = null;
        if (Oopsie.is(Oopsie, this.$cause)) {
            cause = this.$cause.$serializeCause();
        }
        else if (this.$cause instanceof Error) {
            cause = {
                name: this.$cause.name,
                message: this.$cause.message,
                stack: this.$cause.stack || 'Stack not available',
                cause: null,
                details: null,
                locale: {
                    key: this.$locale.key,
                    params: this.$locale.params
                }
            };
        }

        return {
            name: this.$cause.name,
            message: this.$cause.message,
            details: this.$details,
            stack: this.$cause.stack || 'Stack not available',
            cause: cause,
                locale: {
                    key: this.$locale.key,
                    params: this.$locale.params
                }
        };
    }

    /**
     * Returns a serializable object representation of this error
     * @returns 
     */
    public serialize(): IOopsie<TDetails> {
        return {
            name: this.name,
            message: this.message,
            stack: this.getStack(),
            cause: this.$serializeCause(),
            details: this.getDetails(),
            locale: {
                key: this.$locale.key,
                params: this.$locale.params
            }
        };
    }

    private $getStackCause(): string | null {
        if (!this.$cause) {
            return null;
        }

        let trace: string = dedent`\nCaused by:
        ${this.$cause.stack || 'No Stack Available'}`;

        if (Oopsie.is(Oopsie, this.$cause)) {
            let subcause: string | null = this.$cause.$getStackCause();
            if (subcause !== null) {
                trace += subcause;
            }
        }

        return trace;
    }

    /**
     * Recursively creates a stack trace
     * @returns 
     */
    public getStack(): string {
        let causedTrace: string | null = this.$getStackCause();

        let stack: string = dedent`Oopsie Stacktrace:
        ${this.stack || 'Stack not available'}
        `;

        if (causedTrace) {
            stack += causedTrace;
        }

        return stack;
    }

    /**
     * Attempts to wrap a thrown object around a generic Oopsie.
     * 
     * If x is already an Oopsie, the oopsie is returned as is. Otherwise an
     * attempt to wrap x is made:
     * 
     * If x is an Error, it will be adapted using a generic Oopsie.
     * If x is a string, it will be used as the message, with no defined cause.
     * 
     * If x is any other object, then a generic oopsie will be made, but
     * without much meaningful data.
     * 
     * @param x 
     */
    public static wrap(x: string | Error | unknown): Oopsie<TSerializables> {
        if (Oopsie.is(Oopsie, x)) {
            // If x is an Oopsie, simply return it as is.
            return x;
        }

        if (x instanceof Error) {
            let o: Oopsie = new Oopsie(x.message);
            if (x.stack) {
                // Carry over the original stack if one exists
                o.stack = x.stack;
            }
            return o;
        }
        else if (typeof x === 'string') {
            // If x is simply a string, use it as an Oopsie message
            return new Oopsie(x);
        }
        else {
            let thrown: string = x?.toString() || 'Unstringifiable';
            try {
                thrown = JSON.stringify(x);
            }
            catch (ex) {}

            // Anything else we don't know how to handle, and cannot be
            // guarenteed to be serializable. We wil attempt ot serialize
            // via JSON.stringify and attach it as additional data.
            return new Oopsie('Unwrappable Error', null, {
                thrown: thrown
            });
        }
    }
}

export interface IOopsieCtor<TDetails extends TSerializables = TSerializables> {
    new (message: string, cause?: Error | null, details?: TDetails | null): Oopsie<TDetails>;
}
