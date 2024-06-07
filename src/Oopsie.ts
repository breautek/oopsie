
import {
    TSerializables,
    ISerializable,
    TSerializable
} from '@breautek/serializer'
import dedent from 'dedent';

export interface IErrorCause {
    name: string;
    message: string;
    stack: string;
    cause: IErrorCause | null;
}

interface _IOopsie {
    name: string;
    message: string;
    stack: string;
    cause: IErrorCause | null;
    details: TSerializables | null;
}

export type IOopsie = TSerializable<_IOopsie>;

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
 * subclass and using the details for user-facing data, such as locale keys
 * and parameters.
 * 
 * When subclassing, avoid attaching state outside of the details unless if that
 * state should be private data, otherwise Oopsie's cannot be created properly
 * with the OopsieFactory.
 */
export class Oopsie<TDetails extends TSerializables = TSerializables> extends Error implements ISerializable<IOopsie> {
    private $cause: Error | null;
    private $details: TSerializables | null;

    public constructor(message: string, cause?: Error | null, details?: TDetails | null) {
        super(message);

        this.name = this.constructor.name;
        this.$cause = cause || null;
        this.$details = details || null;
    }

    public static is<T extends typeof Oopsie>(errorClass: T, x: unknown): x is InstanceType<T> {
        if (!(x instanceof Oopsie)) {
            return false;
        }

        return x instanceof errorClass;
    }

    public getCause(): Error | null {
        return this.$cause;
    }

    public getDetails(): TSerializables | null {
        return this.$details;
    }

    private $serializeCause(): IErrorCause | null {
        if (!this.$cause) {
            return null;
        }

        let cause: IErrorCause | null = null;
        if (Oopsie.is(Oopsie, this.$cause)) {
            cause = this.$cause.$serializeCause();
        }

        return {
            name: this.$cause.name,
            message: this.$cause.message,
            stack: this.$cause.stack || 'Stack not available',
            cause: cause
        };
    }

    /**
     * Returns a serializable object representation of this error
     * @returns 
     */
    public serialize(): IOopsie {
        return {
            name: this.name,
            message: this.message,
            stack: this.getStack(),
            cause: this.$serializeCause(),
            details: this.getDetails()
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
     * If x is an Error, a generic oopsie will be made using Error as the cause.
     * If x is a string, it will be used as the message, with no defined cause.
     * 
     * If x is any other object, then a generic oopsie will be made, but
     * without much meaningful data.
     * 
     * @param x 
     */
    public static wrap(x: string | Error | unknown): Oopsie {
        if (Oopsie.is(Oopsie, x)) {
            return x;
        }

        if (x instanceof Error) {
            return new Oopsie(x.message, x);
        }
        else if (typeof x === 'string') {
            return new Oopsie(x);
        }
        else {
            return new Oopsie('Unwrappable Error');
        }
    }
}

export interface IOopsieCtor {
    new(message: string, cause?: Error | null, details?: TSerializables | null): Oopsie;
}
