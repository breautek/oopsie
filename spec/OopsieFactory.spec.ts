
import {OopsieFactory} from '../src/OopsieFactory';
import {Oopsie, IOopsie} from '../src/Oopsie';

describe('OopsieFactory', () => {
    class TestOopsie extends Oopsie {};
    
    let serializedError: IOopsie
    beforeAll(() => {
        OopsieFactory.getInstance().registerOopsie(TestOopsie);
    });

    beforeEach(() => {
        serializedError = new TestOopsie('Test Oopsie').serialize();
    });
    
    it('can create TestOopsie from serialized object', () => {
        let e: Oopsie = OopsieFactory.getInstance().create(serializedError);
        expect(Oopsie.is(TestOopsie, e)).toBe(true);
    });

    it('will fallback to base Oopsie on unregistered constructors', () => {
        serializedError.name = 'unregistered';
        let e: Oopsie = OopsieFactory.getInstance().create(serializedError);
        expect(Oopsie.is(TestOopsie, e)).toBe(false);
        expect(Oopsie.is(Oopsie, e)).toBe(true);
    });
});
