import { FountainRC, findCharacterInConfig } from "./fountainrc";


// no real way to guess race based on character name or anything else that exists in the script so just look in the .fountainrc file os use 'unknown'
export function findRacialIdentity(rawName: string, config: FountainRC) {
	const configCharacter = findCharacterInConfig(rawName, config);
	if (configCharacter?.['racial identity']) return (configCharacter['racial identity'] as string).toLowerCase();
	return 'unknown';
}


