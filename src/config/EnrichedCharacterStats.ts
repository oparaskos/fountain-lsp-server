import { CharacterStats } from 'fountain-parser';


export interface EnrichedCharacterStats extends CharacterStats {
    Gender: string;
    RacialIdentity: string;
}
