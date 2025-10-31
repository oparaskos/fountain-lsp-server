import { expect } from 'chai';
import { FountainConfigFactory } from '../src/config/FountainConfigFactory';
import { characterDisplayName } from '../src/util/characterDisplayName';
import { enrichCharacterStats } from '../src/config/enrichCharacterStats';

describe("Display Character Names", () => {
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
            },
            'Laura': {
                gender: 'splonk'
            }
        },
        locale: 'en'
    });

    const expected = {
        'JOHN': 'John (♂)',
        'JANE': 'Jane (♀)',
        
        'FEMALE ATTENDANT 3': 'Female Attendant 3 (♀)',
        'YOUNG GIRL': 'Young Girl (♀)',
        'OLD WOMAN': 'Old Woman (♀)',
        'LADY X': 'Lady X (♀)',
        'THE QUEEN': 'The Queen (♀)',

        'MISS SURNAME': 'Miss Surname (♀)',
        'MRS SURNAME': 'Mrs Surname (♀)',
        'MS SURNAME': 'Ms Surname (♀)',
        
        'JIM\'S MOM': 'Jim\'s Mom (♀)',
        'JIM\'S MUM': 'Jim\'s Mum (♀)',
        'JIM\'S MOTHER': 'Jim\'s Mother (♀)',
        'JIM\'S AUNT': 'Jim\'s Aunt (♀)',
        'JIM\'S DAUGHTER': 'Jim\'s Daughter (♀)',
        'JIM\'S NIECE': 'Jim\'s Niece (♀)',
        'JIM\'S MISTRESS': 'Jim\'s Mistress (♀)',
        'JIM\'S GRANDMA': 'Jim\'s Grandma (♀)',
        'JIM\'S GRANDMOTHER': 'Jim\'s Grandmother (♀)',

        'MALE ATTENDANT 3': 'Male Attendant 3 (♂)',
        'YOUNG BOY': 'Young Boy (♂)',
        'OLD MAN': 'Old Man (♂)',
        'LORD X': 'Lord X (♂)',
        'THE KING': 'The King (♂)',
        
        'MR SURNAME': 'Mr Surname (♂)',
        'MISTER SURNAME': 'Mister Surname (♂)',
        'MASTER SURNAME': 'Master Surname (♂)',
        
        'JIM\'S DAD': 'Jim\'s Dad (♂)',
        'JIM\'S FATHER': 'Jim\'s Father (♂)',
        'JIM\'S UNCLE': 'Jim\'s Uncle (♂)',
        'JIM\'S NEPHEW': 'Jim\'s Nephew (♂)',
        'JIM\'S GRANDAD': 'Jim\'s Grandad (♂)',
        'JIM\'S GRANDFATHER': 'Jim\'s Grandfather (♂)',
        
        'LOKI LAUFEYSON': 'Loki Laufeyson', // uncommon name not in dictionary, SON is in a lot of surnames so shouldn't count
    };

    function _characterDisplayName(name, fountainrc) {
        const characterStats = enrichCharacterStats({Name: name}, fountainrc);
        return characterDisplayName(characterStats);
    }

    it(`should return 'Mr Smith (⚲)' for 'MR SMITH' because it is in the config`, () => {
        const result = _characterDisplayName('MR SMITH', fountainrc);
        expect(result).to.equal('Mr Smith (⚲)');
    });

    it(`should return 'Jim (♂)' for 'JIM' as a guess since gender is not in the config`, () => {
        const result = _characterDisplayName('JIM', fountainrc);
        expect(result).to.equal('Jim (♂)');
    });

    it(`should return 'Aaaaaaaaaa' for 'AAAAAAAAAA' because there is no guess and there is no gender in the config`, () => {
        const result = _characterDisplayName('AAAAAAAAAA', fountainrc);
        expect(result).to.equal('Aaaaaaaaaa');
    });

    it(`should return 'Laura (splonk)' for 'Laura' because there is a custom gender in the config`, () => {
        const result = _characterDisplayName('LAURA', fountainrc);
        expect(result).to.equal('Laura (splonk)');
    });

    for(const name of Object.keys(expected)) {
        it(`should return '${expected[name]}' for '${name}'`, () => {
            const result = _characterDisplayName(name, fountainrc);
            expect(result).to.equal(expected[name]);
        });
    }
});
