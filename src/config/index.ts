import { FountainConfigFactory } from './FountainConfigFactory';
import { FountainConfig } from './FountainConfig';

const _instance = new FountainConfigFactory();

export async function clearConfigCache() {
    _instance.flush();
}

export async function getConfig(documentUri: string): Promise<FountainConfig> {
    return _instance.getConfig(documentUri);
}

export function findCharacterInConfig(rawName: string, config?: FountainConfig) {
    return config?.findCharacter(rawName);
}
