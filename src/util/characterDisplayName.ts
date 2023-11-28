import { EnrichedCharacterStats } from '../config/EnrichedCharacterStats';


export function characterDisplayName(characterStats: Partial<EnrichedCharacterStats>) {
    const name = characterStats.Name!;
    const sentenceCaseName = name[0] + name.slice(1).toLocaleLowerCase();
    let genderIcon = null;
    if (characterStats.Gender) {
        genderIcon = {
            male: "♂",
            female: "♀",
            trans: "⚧",
            agender: "∅",
            intersex: "⚥",
            genderfluid: "☿",
            neuter: '⚲'
        }[characterStats.Gender?.toLowerCase()?.replace(/[^a-z]/, '')];
        if (genderIcon) genderIcon = ` (${genderIcon})`;
        else genderIcon = '';
    }

    return `${sentenceCaseName}${genderIcon}`;
}
