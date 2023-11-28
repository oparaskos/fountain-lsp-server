import { guessGender } from '../guessGender';
import { FountainConfig } from './FountainConfig';
import { findRacialIdentity } from '../racialIdentity';

export function enrichCharacterStats(it: { Name: string; }, fountainrc: FountainConfig) {
    return {
        ...it,
        Gender: guessGender(it.Name, fountainrc),
        RacialIdentity: findRacialIdentity(it.Name, fountainrc)
    };
}
