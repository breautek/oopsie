
import * as api from '../src/api';
import {Oopsie, IOopsie, IErrorCause} from '../src/Oopsie';
import {OopsieFactory} from '../src/OopsieFactory';

describe('Public API', () => {
    it('OopsieFactory', () => {
        expect(api.OopsieFactory).toBe(OopsieFactory);
    });

    it('Oopsie', () => {
        expect(api.Oopsie).toBe(Oopsie);
    });

    it('IOopsieCtor', () => {
        let x: api.IOopsieCtor = Oopsie;
    });

    it('IErrorCause', () => {
        let x: IErrorCause = {
            name: 'test',
            message: 'test',
            stack: 'test',
            cause: null
        };
    });

    it('IOopsie', () => {
        let x: IOopsie = new Oopsie('test message').serialize();
    });
});

