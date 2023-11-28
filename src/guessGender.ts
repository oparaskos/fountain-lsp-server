import { getGender } from "gender-detection-from-name";
import { FountainConfig } from './config/FountainConfig';

const DEFAULT_LOCALE = "en" as const;
const UNKNOWN_GENDER = 'unknown' as const;
const GENDER_LABEL_MALE = 'male' as const;
const GENDER_LABEL_FEMALE = 'female' as const;
const SUPPORTED_LOCALES = ["en" as const, "it" as const];

const WORDS_INDICATING_FEMALE_CHARACTER = [
	"female",
	"woman",
	"girl",
	"mum",
	"mom",
	"aunt",
	"mother",
	"niece",
	"grandma",
	"mistress",
	"mrs",
	"miss",
	"ms",
	"daughter",
	"lady",
	"queen"
];

const WORDS_INDICATING_MALE_CHARACTER = [
	"male",
	"man",
	"boy",
	"dad",
	"uncle",
	"father",
	"nephew",
	"master",
	"mister",
	"mr",
	// "son", // too common in surnames 
	"lord",
	"king"
];

/**
 * Attempt to guess gender from a character name. 
 * 
 * If a characters name contains gendered words which can be used to hint at a gender then it will use those first.
 * (e.g MISTER SARAH will return 'female')
 * 
 * If there are none, then the npm package [gender-detection-from-name](npmjs.com/package/gender-detection-from-name) handles name conversions.
 * 
 * @note This function will only guess between 'male' and 'female' as gender's assuming that the characters name conforms to some bad assumptions
 * 		 a. X is a man's name, Y is a woman's name (John must be a man, Sarah must be woman)
 *       b. A person's gender identity does not change through the script.
 * @note Genders in the application as a whole are strings (not a fixed set of values) which can represent any number of options, the fountainrc file allows users to override these assumptions.
 * 
 * @param rawName 
 * @param config 
 * @returns 
 */
export function guessGender(rawName: string, config: FountainConfig) {
	try {
		const configCharacter = config.findCharacter(rawName);
		if (configCharacter?.gender) return (configCharacter.gender as string).toLowerCase();
		// Guess based on common english names using a library TODO: find a more comprehensive one..
		const name = rawName.toLocaleLowerCase().replace(/young|old|adult|kid/ig, '');
		const initialGuess = getGender(name, supportedLocale(config));
		if (initialGuess != UNKNOWN_GENDER)
			return initialGuess;
		// If no luck look for clues by common gendered words -- problematic because 'postman' is often in place of 'postwoman'.
		const femaleness: number = WORDS_INDICATING_FEMALE_CHARACTER.reduce((acc, it) => acc += name.includes(it) ? 1 : 0, 0);
		let maleness: number = WORDS_INDICATING_MALE_CHARACTER.reduce((acc, it) => acc += name.includes(it) ? 1 : 0, 0);
		maleness = fixupMaleManSuffix(name, maleness);
		if (maleness > femaleness)
			return GENDER_LABEL_MALE;
		if (femaleness > maleness)
			return GENDER_LABEL_FEMALE;
		return UNKNOWN_GENDER;
	} catch(e) {
		return UNKNOWN_GENDER;
	}
}

function supportedLocale(config: FountainConfig): "en" | "it" {
	const configuredLocale = config?.locale || DEFAULT_LOCALE;
	if((SUPPORTED_LOCALES as string[]).includes(configuredLocale)) {
		return configuredLocale as typeof SUPPORTED_LOCALES[0];
	} else {
		return DEFAULT_LOCALE;
	}
}

// In cases where -male is part of fe-male then erase its impact on the maleness score.
function fixupMaleManSuffix(name: string, maleness: number) {
	if (name.includes("woman")) // man will also match
		maleness--;
    if (name.includes("female")) // male will also match
        maleness--;
    if (name.includes("mrs")) // mr will also match
        maleness--;
	return maleness;
}

