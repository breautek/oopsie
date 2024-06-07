"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Oopsie_1 = require("../src/Oopsie");
describe('Oopsie', () => {
    it('can make an oopsie', () => {
        let oops = new Oopsie_1.Oopsie('test oopsie');
        expect(oops.name).toBe('Oopsie');
    });
    it('name is the current constructor', () => {
        class CustomOopsie extends Oopsie_1.Oopsie {
        }
        let oops = new CustomOopsie('custom');
        expect(oops.name).toBe('CustomOopsie');
    });
    describe('wrapping', () => {
        it('wrapped error creates an oopsie with the error has the cause', () => {
            let e = new Error('test error');
            let o = Oopsie_1.Oopsie.wrap(e);
            expect(o.message).toBe('test error');
            expect(o.getCause()).toBe(e);
        });
        it('wrapped oopsie returns the oopsie as is', () => {
            let e = new Oopsie_1.Oopsie('test error');
            let o = Oopsie_1.Oopsie.wrap(e);
            expect(o).toBe(e);
        });
        it('wrapped string creates an oopsie', () => {
            let e = 'thrown string';
            let o = Oopsie_1.Oopsie.wrap(e);
            expect(o.message).toBe('thrown string');
        });
        it('wrapping an unsupported object creates an unwrappable oopsie', () => {
            let e = {};
            let o = Oopsie_1.Oopsie.wrap(e);
            expect(o.message).toBe('Unwrappable Error');
        });
    });
    describe('stacktraces', () => {
        it('produces a simple stacktrace', () => {
            let o = new Oopsie_1.Oopsie('simple');
            expect(o.getStack()).toMatch(/^Oopsie Stacktrace:\s+Oopsie: simple\s+at/);
        });
        it('produces stacktraces with a cause', () => {
            let caused = new Oopsie_1.Oopsie('the cause');
            let o = new Oopsie_1.Oopsie('simple with a cause', caused);
            expect(o.getStack()).toMatch(/^Oopsie Stacktrace:\s+Oopsie: simple with a cause\s+at+(.|\n|\r)+Caused by:\n\s+Oopsie: the cause\s+at/);
        });
        it('produces stacktraces with multiple causes', () => {
            let rootCause = new Error('The root cause');
            let caused = new Oopsie_1.Oopsie('the cause', rootCause);
            let o = new Oopsie_1.Oopsie('simple with a cause', caused);
            expect(o.getStack()).toMatch(/^Oopsie Stacktrace:\s+Oopsie: simple with a cause\s+at+(.|\n)+Caused by:\n\s+Oopsie: the cause\s+at+(.|\n)+Caused by:\s+Error: The root cause\s+at/);
        });
    });
    describe('serialization', () => {
        it('can serialize a simple oopsie', () => {
            let o = new Oopsie_1.Oopsie('simple');
            let obj = o.serialize();
            expect(obj).toMatchObject({
                name: 'Oopsie',
                message: 'simple',
                cause: null,
                details: null,
                stack: expect.stringMatching(/^Oopsie Stacktrace:\s+Oopsie: simple\s+at/gm)
            });
        });
        it('can serialize an oopsie with an error cause', () => {
            let cause = new Error('the main cause');
            let o = new Oopsie_1.Oopsie('simple', cause);
            let obj = o.serialize();
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
            let o = new Oopsie_1.Oopsie('simple', null, {
                userID: 123
            });
            let obj = o.serialize();
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
            class CustomOopsie extends Oopsie_1.Oopsie {
            }
            let error = new CustomOopsie('test error');
            let e = error;
            expect(Oopsie_1.Oopsie.is(CustomOopsie, e)).toBe(true);
        });
        it('is CustomOopsie should return false', () => {
            class CustomOopsie extends Oopsie_1.Oopsie {
            }
            class AnotherOoopsie extends Oopsie_1.Oopsie {
            }
            let error = new CustomOopsie('test error');
            let e = error;
            expect(Oopsie_1.Oopsie.is(AnotherOoopsie, e)).toBe(false);
        });
    });
});
