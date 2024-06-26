
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
        expect(e).toBeInstanceOf(TestOopsie);
    });

    it('will fallback to base Oopsie on unregistered constructors', () => {
        serializedError.name = 'unregistered';
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        let e: Oopsie = OopsieFactory.getInstance().create(serializedError);
        expect(Oopsie.is(TestOopsie, e)).toBe(false);
        expect(Oopsie.is(Oopsie, e)).toBe(true);
        expect(console.warn).toHaveBeenNthCalledWith(1, 'Oopsie named "unregistered" attempted to be created via OopsieFactory but unregistered is not registered.');
    });
});
