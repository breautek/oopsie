
import {
    Oopsie,
    IOopsie
} from '../src/Oopsie';

describe('Oopsie', () => {
    it('can make an oopsie', () => {
        let oops: Oopsie = new Oopsie('test oopsie');
        expect(oops.name).toBe('Oopsie');
    });

    it('name is the current constructor', () => {
        class CustomOopsie extends Oopsie {}

        let oops: CustomOopsie = new CustomOopsie('custom');
        expect(oops.name).toBe('CustomOopsie');
    });

    // describe('wrapping', () => {
    //     it('wrapped error creates an oopsie with the error has the cause', () => {
    //         let e: Error = new Error('test error');
    //         let o: Oopsie = Oopsie.wrap(e);
    //         expect(o.message).toBe('test error');
    //         expect(o.getCause()).toBe(e);
    //     });

    //     it('wrapped oopsie returns the oopsie as is', () => {
    //         let e: Oopsie = new Oopsie('test error');
    //         let o: Oopsie = Oopsie.wrap(e);
    //         expect(o).toBe(e);
    //     });

    //     it('wrapped string creates an oopsie', () => {
    //         let e: string = 'thrown string';
    //         let o: Oopsie = Oopsie.wrap(e);
    //         expect(o.message).toBe('thrown string');
    //     });

    //     it('wrapping an unsupported object creates an unwrappable oopsie', () => {
    //         let e: {} = {};
    //         let o: Oopsie = Oopsie.wrap(e);
    //         expect(o.message).toBe('Unwrappable Error');
    //     });
    // });

    describe('stacktraces', () => {
        it('produces a simple stacktrace', () => {
            let o: Oopsie = new Oopsie('simple');
            expect(o.getStack()).toMatch(/^Oopsie Stacktrace:\s+Oopsie: simple\s+at/)
        });

        it('produces stacktraces with a cause', () => {
            let caused: Oopsie = new Oopsie('the cause');
            let o: Oopsie = new Oopsie('simple with a cause', caused);
            expect(o.getStack()).toMatch(/^Oopsie Stacktrace:\s+Oopsie: simple with a cause\s+at+(.|\n|\r)+Caused by:\n\s+Oopsie: the cause\s+at/)
        });

        it('produces stacktraces with multiple causes', () => {
            let rootCause: Error = new Error('The root cause');
            let caused: Oopsie = new Oopsie('the cause', rootCause);
            let o: Oopsie = new Oopsie('simple with a cause', caused);
            expect(o.getStack()).toMatch(/^Oopsie Stacktrace:\s+Oopsie: simple with a cause\s+at+(.|\n)+Caused by:\n\s+Oopsie: the cause\s+at+(.|\n)+Caused by:\s+Error: The root cause\s+at/)
        });
    });

    describe('serialization', () => {
        it('can serialize a simple oopsie', () => {
            let o: Oopsie = new Oopsie('simple');
            let obj: IOopsie = o.serialize();
            expect(obj).toMatchObject({
                name: 'Oopsie',
                message: 'simple',
                cause: null,
                details: null,
                stack: expect.stringMatching(/^Oopsie Stacktrace:\s+Oopsie: simple\s+at/gm)
            });
        });

        it('can serialize an oopsie with an error cause', () => {
            let cause: Error = new Error('the main cause');
            let o: Oopsie = new Oopsie('simple', cause);
            let obj: IOopsie = o.serialize();
            expect(obj).toMatchObject({
                name: 'Oopsie',
                message: 'simple',
                cause: {
                    name: 'Error',
                    message: 'the main cause',
                    stack: expect.stringMatching(/^Error: the main cause\s+at/gm)
                },
                details: null,
                stack: expect.stringMatching(/^Oopsie Stacktrace:\s+Oopsie: simple\s+at/gm)
            });
        });

        it('can serialize an oopsie with details', () => {
            let o: Oopsie = new Oopsie('simple', null, {
                userID: 123
            });
            let obj: IOopsie = o.serialize();
            expect(obj).toMatchObject({
                name: 'Oopsie',
                message: 'simple',
                cause: null,
                details: {
                    userID: 123
                },
                stack: expect.stringMatching(/^Oopsie Stacktrace:\s+Oopsie: simple\s+at/gm)
            });
        });
    });

    describe('type asserts', () => {
        it('is CustomOopsie should return true', () => {
            class CustomOopsie extends Oopsie {}

            let error: CustomOopsie = new CustomOopsie('test error');
            let e: unknown = error;

            expect(Oopsie.is(CustomOopsie, e)).toBe(true);
        });

        it('is CustomOopsie should return false', () => {
            class CustomOopsie extends Oopsie {}
            class AnotherOoopsie extends Oopsie {}

            let error: CustomOopsie = new CustomOopsie('test error');
            let e: unknown = error;

            expect(Oopsie.is(AnotherOoopsie, e)).toBe(false);
        });
    });
});
