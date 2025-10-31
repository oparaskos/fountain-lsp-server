import { CodeLens, Range, Command } from "vscode-languageserver";
import { FountainScript, DialogueElement, SceneElement } from "fountain-parser";
import { formatTime } from './util/formatTime';
import { getConfig } from './config';
import { getStatsForCharacter } from './util/getStatsForCharacter';
import { locationDisplayName } from './util/locationDisplayName';
import { characterDisplayName } from './util/characterDisplayName';
import { ExtensionSettings } from './ExampleSettings';


export function dialogueLens(lines: string[], parsedScript: FountainScript, uri: string): CodeLens[] {
    const dialogueByCharacters: Record<string, DialogueElement[]> = parsedScript.dialogueByCharacters;
    return Object.keys(dialogueByCharacters).flatMap(characterName => {
        const dialogues = dialogueByCharacters[characterName];
        return dialogueByCharacters[characterName].map(dialogue => {
            const lineNo = dialogue.tokens?.[0]?.codeLocation?.start?.line || 0;
            return {
                range: Range.create(lineNo, 0, lineNo, lines[lineNo].length),
                data: { name: characterName, uri, lines: dialogues.length, type: 'character' }
            };
        });
    });
}


export function locationsLens(lines: string[], parsedScript: FountainScript, uri: string): CodeLens[] {
    const locationsByName: Record<string, SceneElement[]> = parsedScript.scenesByLocationName;
    return Object.keys(locationsByName).flatMap(locationName => {
        const scenes = locationsByName[locationName];
        return scenes.map(scene => {
            const lineNo = scene.tokens?.[0]?.codeLocation?.start?.line || 0;
            return {
                range: Range.create(lineNo, 0, lineNo, lines[lineNo].length),
                data: { name: locationName, uri, references: scenes.length, type: 'location' }
            };
        });
    });
}


export function scenesLens(lines: string[], parsedScript: FountainScript, uri: string): CodeLens[] {
    const scenes: SceneElement[] = parsedScript.scenes;
    return scenes.map(scene => {
        const lineNo = scene.tokens?.[0]?.codeLocation?.start?.line || 0;
        return {
            range: Range.create(lineNo, 0, lineNo, lines[lineNo].length),
            data: { name: scene.title, uri, duration: formatTime(scene.duration), type: 'scene' }
        };
    });
}

export const handleCodeLens = (
    parsedDocuments: Record<string, FountainScript>,
    lines: Record<string, string[]>,
    params: { textDocument: { uri: string; }; }) => {
    const uri = params.textDocument.uri;
    const parsedScript = parsedDocuments[uri];
    return [
        ...dialogueLens(lines[uri], parsedScript, uri),
        ...locationsLens(lines[uri], parsedScript, uri),
        ...scenesLens(lines[uri], parsedScript, uri)
    ];
};


export async function resolveCodeLens(
    parsedDocuments: Record<string, FountainScript>,
    lines: Record<string, string[]>,
    settings: ExtensionSettings,
    codeLens: CodeLens) {
    const args = { ...codeLens.data, range: codeLens.range };

    const parsedScript = parsedDocuments[args.uri];
    const fountainrc = await getConfig(args.uri);


    if (args.type === 'character') {
        const characterStats = getStatsForCharacter(parsedScript, fountainrc, settings, args.name);
        codeLens.command = Command.create(`Character ${characterDisplayName(characterStats)} (${args.lines} lines)`, 'fountain.analyseCharacter', args);
    } else if (args.type === 'location') {
        codeLens.command = Command.create(`Location ${locationDisplayName(codeLens)} (${args.references} references)`, 'fountain.analyseLocation', args);
    } else if (args.type === 'scene') {
        codeLens.command = Command.create(`Scene Duration ${args.duration}`, 'fountain.analyseScene', args);
    }
    return codeLens;
}
