import { FountainScript, CharacterStats } from 'fountain-parser';
import { FountainConfig } from '../config/FountainConfig';
import { EnrichedCharacterStats } from '../config/EnrichedCharacterStats';
import { enrichCharacterStats } from '../config/enrichCharacterStats';
import { ExtensionSettings as ExtensionSettings } from '../ExampleSettings';


export function getStatsForCharacter(parsedScript: FountainScript, fountainrc: FountainConfig, settings: ExtensionSettings, characterName: string): Partial<EnrichedCharacterStats> {
    const result: CharacterStats[] = parsedScript.statsPerCharacter;
    const characterStats = result.find(it => it.Name === characterName) || {
        Name: characterName
    };
    if (!!characterStats && settings.guessCharacterGenders) {
        return enrichCharacterStats(characterStats, fountainrc);
    }
    return characterStats;
}
