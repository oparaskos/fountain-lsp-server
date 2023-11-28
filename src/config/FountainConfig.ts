import { simpleNameTransform, stripSpecial } from './simpleNameTransform';
import { FountainRC, FountainCharacterConfig } from './ConfigTypes';


export class FountainConfig implements FountainRC {
    constructor(
        public locale?: string,
        public characters?: Record<string, FountainCharacterConfig>
    ) { }


    public findCharacter(rawName: string) {
        const characters = this.characters;
        if (characters) {
            const name = simpleNameTransform(rawName);
            if (characters[name]) return characters[name];
            const mappedName = Object.keys(characters).find(it => stripSpecial(it) === stripSpecial(name));
            if (mappedName) return characters[mappedName];
        }
        return null;
    }
}
