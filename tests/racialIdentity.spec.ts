import { expect } from 'chai';
import { findRacialIdentity } from "../src/racialIdentity";

describe("Get racial identity from character names (only via fountainrc, no guesswork magic)", () => {
    const fountainrc = {
        characters: {
            'MR SMITH': {
                'racial identity': 'white/british'
            },
            '\u0041\u006d\u00e9\u006c\u0069\u0065': {
                'racial identity': 'WHITE/FRENCH'
            }
            
        },
        locale: 'en'
    };
    
    const expected = {
        '\u0041\u006d\u0065\u0301\u006c\u0069\u0065': 'white/french',
        '\u0041\u006d\u00e9\u006c\u0069\u0065': 'white/french',
        'Amelie': 'unknown',
        'Mr. Smith': 'white/british',
        'Mr Smith': 'white/british',
        'MR SMITH': 'white/british',
    };

    for(const name of Object.keys(expected)) {
        it(`should return ${expected[name]} for '${name}'`, () => {
            const result = findRacialIdentity(name, fountainrc);
            expect(result).to.equal(expected[name]);
        });
    }
});