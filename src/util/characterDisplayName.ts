import { EnrichedCharacterStats } from '../config/EnrichedCharacterStats';
import { UNKNOWN_GENDER } from '../guessGender';

const genderIcons: {[k: string]: string} = {
    male: "♂",
    female: "♀",
    trans: "⚧",
    agender: "∅",
    intersex: "⚥",
    genderfluid: "☿",
    neuter: '⚲'
};

function titleCase(str: string): string {
    return str.split(' ')
        .map(it => it[0] + it.slice(1).toLocaleLowerCase())
        .join(' ');
}

function getGenderIcon(gender: string | null | undefined): string | null {
    if (gender && gender != UNKNOWN_GENDER) {
        const genderIcon = genderIcons[gender.toLowerCase()?.replace(/[^a-z]/, '')];
        if (genderIcon) {
            return `(${genderIcon})`;
        }
        return `(${gender})`;
    }
    return null;
}

export function characterDisplayName(characterStats: Partial<EnrichedCharacterStats>) {
    const name = titleCase(characterStats.Name!);
    const genderIcon = getGenderIcon(characterStats.Gender);
    return [name, genderIcon].filter(it => !!it).join(' ');
}
