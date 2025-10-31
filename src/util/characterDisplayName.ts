import { EnrichedCharacterStats } from '../config/EnrichedCharacterStats';

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

function getGenderIcon(gender: string | null): string | null {
    if (gender) {
        const genderIcon = genderIcons[gender.toLowerCase()?.replace(/[^a-z]/, '')];
        if (genderIcon) {
            return `(${genderIcon})`;
        }
    }
    return ''
}

export function characterDisplayName(characterStats: Partial<EnrichedCharacterStats>) {
    const name = titleCase(characterStats.Name!);
    const genderIcon = getGenderIcon(characterStats.Gender);
    return [name, genderIcon].filter(it => !!it).join(' ');
}
