import { CodeLens } from 'vscode-languageserver/node';


export function locationDisplayName(codeLens: CodeLens) {
    const name = codeLens.data.name;
    return name[0] + name.slice(1).toLocaleLowerCase();
}
