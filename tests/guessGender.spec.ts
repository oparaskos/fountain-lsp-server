import { expect } from 'chai';
import { guessGender } from "../src/guessGender";
import { FountainConfigFactory } from '../src/config/FountainConfigFactory';

describe("Guess Gender from character names", () => {
    const fountainrc = new FountainConfigFactory().fromObject({
        characters: {
            'MR SMITH': {
                gender: 'neuter'
            },
            'Jim': {
                'racial identity': 'blah'
            },
            'aaaaaaaaaaaa': {
                'racial identity': 'blah'
            }
        },
        locale: 'en'
    });

    const expected = {
        'JOHN': 'male',
        'JANE': 'female',
        
        'FEMALE ATTENDANT 3': 'female',
        'YOUNG GIRL': 'female',
        'OLD WOMAN': 'female',
        'LADY X': 'female',
        'THE QUEEN': 'female',

        'MISS SURNAME': 'female',
        'MRS SURNAME': 'female',
        'MS SURNAME': 'female',
        
        'JIM\'S MOM': 'female',
        'JIM\'S MUM': 'female',
        'JIM\'S MOTHER': 'female',
        'JIM\'S AUNT': 'female',
        'JIM\'S DAUGHTER': 'female',
        'JIM\'S NIECE': 'female',
        'JIM\'S MISTRESS': 'female',
        'JIM\'S GRANDMA': 'female',
        'JIM\'S GRANDMOTHER': 'female',

        'MALE ATTENDANT 3': 'male',
        'YOUNG BOY': 'male',
        'OLD MAN': 'male',
        'LORD X': 'male',
        'THE KING': 'male',
        
        'MR SURNAME': 'male',
        'MISTER SURNAME': 'male',
        'MASTER SURNAME': 'male',
        
        'JIM\'S DAD': 'male',
        'JIM\'S FATHER': 'male',
        'JIM\'S UNCLE': 'male',
        'JIM\'S NEPHEW': 'male',
        'JIM\'S GRANDAD': 'male',
        'JIM\'S GRANDFATHER': 'male',
        
        'LOKI LAUFEYSON': 'unknown', // uncommon name not in dictionary, SON is in a lot of surnames so shouldn't count
    };

    it(`should return neuter for 'MR SMITH' because it is in the config`, () => {
        const result = guessGender('MR SMITH', fountainrc);
        expect(result).to.equal('neuter');
    });

    it(`should return male for 'JIM' as a guess since gender is not in the config`, () => {
        const result = guessGender('JIM', fountainrc);
        expect(result).to.equal('male');
    });

    it(`should return unknown for 'AAAAAAAAAA' because there is no guess and there is no gender in the config`, () => {
        const result = guessGender('AAAAAAAAAA', fountainrc);
        expect(result).to.equal('unknown');
    });

    for(const name of Object.keys(expected)) {
        it(`should return ${expected[name]} for '${name}'`, () => {
            const result = guessGender(name, fountainrc);
            expect(result).to.equal(expected[name]);
        });
    }
});
