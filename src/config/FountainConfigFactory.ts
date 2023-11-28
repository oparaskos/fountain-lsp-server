import { readFile, stat } from 'fs/promises';
import path from 'path';
import { URI } from 'vscode-uri';
import YAML from "yaml";
import { logger } from '../logger';
import { memoize } from 'memoize-utils/decorator';
import { simpleNameTransform } from './simpleNameTransform';
import { FountainRC } from './ConfigTypes';
import { FountainConfig } from './FountainConfig';

const EMPTY_CONFIG = new FountainConfig();
const _configCache = new Map();
export class FountainConfigFactory {
    private configFileName: string = '.fountainrc';

    public flush() {
        _configCache.clear();
    }

    @memoize({ cache: _configCache })
    async getConfig(documentUri: string): Promise<FountainConfig> {
        try {
            const documentPath = URI.parse(documentUri).fsPath;
            const documentFolder = path.dirname(documentPath);
            const pathParts = path.normalize(documentFolder).split(path.sep);
            while (pathParts.length > 0) {
                const configPath = path.join('/', ...pathParts, this.configFileName);
                try {
                    if ((await stat(configPath)).isFile()) {
                        const file = await readFile(configPath, 'utf8');
                        return this.parseConfig(file);
                    }
                } catch (e) {
                    logger.trace(`[FountainConfigFactory#getConfig]: No ${this.configFileName} file at ${configPath}`);
                }
                pathParts.pop();
            }
            return EMPTY_CONFIG;
        } catch (e: unknown) {
            logger.error(`[FountainConfigFactory#getConfig]: Could not load ${this.configFileName} file`, e);
            return EMPTY_CONFIG;
        }
    }

    private parseConfig(file: string) {
        const config: FountainRC = YAML.parse(file);
        return this.fromObject(config);
    }

    public fromObject(config: FountainRC) {
        if (config.characters) {
            // Lowercase character names and apply unicode normalisation to enable easier lookups.
            config.characters = Object.fromEntries(
                Object.entries(config.characters).map(([name, c]) => ([simpleNameTransform(name), c]))
            );
        }
        return new FountainConfig(config.locale, config.characters);

    }
}
