import { readFile, stat } from 'fs/promises';
import path from 'path';
import { URI } from 'vscode-uri';
import YAML from "yaml";
import { logger } from './logger';

const EMPTY_CONFIG = {};

export interface FountainRC {
	locale?: string;
	characters?: {[characterName: string]: {
		'racial identity'?: string;
		gender?: string;
	}};
}


// TODO: config cache.
export async function getConfig(documentUri: string): Promise<FountainRC> {
	logger.log("getConfig");
	try {
		const documentPath = URI.parse(documentUri).fsPath;
		const documentFolder = path.dirname(documentPath);
		const pathParts = path.normalize(documentFolder).split(path.sep);
		while (pathParts.length > 0) {
			const fountainrcPath = path.join('/', ...pathParts, '.fountainrc');
			try {
				if ((await stat(fountainrcPath)).isFile()) {
					const file = await readFile(fountainrcPath, 'utf8');
					return YAML.parse(file);
				}
			} catch (e) {
				logger.trace(`No fountainrc file at ${fountainrcPath}`);
			}
			pathParts.pop();
		}
		return EMPTY_CONFIG;
	} catch (e: unknown) {
		logger.error('Could not load .fountainrc file', e);
		return EMPTY_CONFIG; // TODO:
	}
}

const transformName = (str: string) => {
	return str
		.normalize()
		.toLowerCase()
		.replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g, ''); 
};

export function findCharacterInConfig(rawName: string, config?: FountainRC) {
	const characters = config?.characters;
	if (characters) {
		// exact match, just do normal lookup
		if (characters[rawName]) return characters[rawName];

		const mappedName = Object.keys(characters).find(it => transformName(it) === transformName(rawName));
		if (mappedName) return characters[mappedName];

	}
	return null;
}
