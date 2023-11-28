import { FountainConfig } from './config/FountainConfig';


// no real way to guess race based on character name or anything else that exists in the script so just look in the .fountainrc file os use 'unknown'
export function findRacialIdentity(rawName: string, config: FountainConfig) {
	const configCharacter = config.findCharacter(rawName);
	if (configCharacter?.['racial identity']) return (configCharacter['racial identity'] as string).toLowerCase();
	return 'unknown';
}


