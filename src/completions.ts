import { CompletionItem, CompletionItemKind, TextDocumentPositionParams } from "vscode-languageserver";
import { FountainTitlePage, FountainScript } from "fountain-parser";
import { isTitlePage } from "./util/isTitlePage";

const revisionDocumentation = `New revisions are generally printed on different-colored paper, and named accordingly. The WGA order for revisions is:
* White Draft (original)
* Blue Revision
* Pink Revision
* Yellow Revision
* Green Revision
* Goldenrod Revision
* Buff Revision
* Salmon Revision
* Cherry Revision
* Second Blue Revision
* Second Pink Revision
* Second Yellow Revision
* Second Green Revision
* Second Goldenrod Revision
* Second Buff Revision
* Second Salmon Revision
* Second Cherry Revision`;

type CompletionHandler = (currentLine: string, parsedDocument: FountainScript) => CompletionItem[];

export const closingCompletions: CompletionHandler = () => {
    return [
        { label: "FADE OUT.", kind: CompletionItemKind.Event },
        { label: "FADE TO BLACK.", kind: CompletionItemKind.Event },
        { label: "> BURN TO WHITE.", kind: CompletionItemKind.Event },
    ];
};

export const characterCompletions: CompletionHandler = (_currentLine: string, parsedDocument: FountainScript) => {
    return [
        ...parsedDocument.characterNames.map((it: string) => ({ label: it, kind: CompletionItemKind.Value })),
        { label: "(O.S.)", kind: CompletionItemKind.Snippet },
        { label: "(CONT'D)", kind: CompletionItemKind.Snippet },
        { label: "(V.O.)", kind: CompletionItemKind.Snippet },
        { label: "(on TV)", kind: CompletionItemKind.Snippet },
    ];
};


export const dialogueCompletions: CompletionHandler = () => {
    return [
        { label: "(beat)", kind: CompletionItemKind.Snippet },
    ];
};

export const openingCompletions: CompletionHandler = () => {
    return [
        { label: "FADE IN:", kind: CompletionItemKind.Event },
    ];
};

export const sceneCompletions: CompletionHandler = () => {
    return [
        { label: "INT. ", kind: CompletionItemKind.Class },
        { label: "EST. ", kind: CompletionItemKind.Class },
        { label: "EXT. ", kind: CompletionItemKind.Class },
        { label: "INT/EXT. ", kind: CompletionItemKind.Class },
    ];
};

export const transitionCompletions: CompletionHandler = () => {
    return [
        { label: "DISSOLVE TO:", kind: CompletionItemKind.Event },
        { label: "MATCH CUT TO:", kind: CompletionItemKind.Event },
        { label: "SMASH CUT TO:", kind: CompletionItemKind.Event },
        { label: "CROSSFADE TO:", kind: CompletionItemKind.Event },
        { label: "FLASHCUTS TO:", kind: CompletionItemKind.Event },
        { label: "BACK TO:", kind: CompletionItemKind.Event },
        { label: "FLASHBACK TO:", kind: CompletionItemKind.Event },
        { label: "TRANSITION TO:", kind: CompletionItemKind.Event },
        { label: "COME TO:", kind: CompletionItemKind.Event },
        { label: "FADE TO:", kind: CompletionItemKind.Event },
        { label: "CUT TO:", kind: CompletionItemKind.Event }
    ];
};

export const titlePageCompletions: CompletionHandler = (_currentLine, parsedDocument) => {
    const completions: CompletionItem[] = [];
    const titlePage = parsedDocument.children[0];
    const attributes = (titlePage as FountainTitlePage)?.attributes || {};
    const attributeNames = Object.keys(attributes).map(it => it.replace(' ', '_').toLowerCase())
    if (!attributeNames.includes("title"))
        completions.push({ label: "Title", detail: "The title of the screenplay", kind: CompletionItemKind.Property });
    if (!attributeNames.includes("credit"))
        completions.push({ label: "Credit", detail: "How the author is credited", documentation: 'Inserted between the title and the author. Good practice is to simply use "Written by" (avoid "Created by" etc...).', kind: CompletionItemKind.Property });
    if (!attributeNames.includes("author"))
        completions.push({ label: "Author", detail: "The name of the author", documentation: "This is you! If there are several authors, you can optionally use the 'authors' tag instead.", kind: CompletionItemKind.Property });
    if (!attributeNames.includes("source"))
        completions.push({ label: "Source", detail: "An additional source for the screenplay", documentation: "This will be inserted below the author, and is useful if the story has an additional source (such as 'Original story by x', 'Based on the novel by x', etc...)", kind: CompletionItemKind.Property });
    if (!attributeNames.includes("notes"))
        completions.push({ label: "Notes", detail: "Additional notes", documentation: 'Any additional notes you wish to include in the title page', kind: CompletionItemKind.Property });
    if (!attributeNames.includes("draft_date"))
        completions.push({ label: "Draft Date", detail: "The date of the current draft", documentation: 'Useful if you have several drafts and need to keep track of when they were written', kind: CompletionItemKind.Property });
    if (!attributeNames.includes("date"))
        completions.push({ label: "Date", detail: "The date of the screenplay", documentation: 'Only include the date it if necessary for production purposes. Someone reading your screenplay does not generally need to know when it was written.', kind: CompletionItemKind.Property });
    if (!attributeNames.includes("copyright"))
        completions.push({ label: "Copyright", detail: "Copyright information", documentation: "**Warning:** Including copyright information tends to be unecessary, and may even seem unprofessional in some cases.", kind: CompletionItemKind.Property, deprecated: true });
    if (!attributeNames.includes("watermark"))
        completions.push({ label: "Watermark", detail: "A watermark displayed on every page", documentation: 'A watermark displayed diagonally on every single page', kind: CompletionItemKind.Property });
    if (!attributeNames.includes("font"))
        completions.push({ label: "Font", detail: "The font used in the screenplay", documentation: `Generally a monospace courier-type font. BetterFountain's default is [Courier Prime](https://quoteunquoteapps.com/courierprime/), with added support for cyrillic.`, kind: CompletionItemKind.Property });
    if (!attributeNames.includes("revision"))
        completions.push({ label: "Revision", detail: "The name of the current and past revisions", documentation: revisionDocumentation, kind: CompletionItemKind.Property });
    completions.push({ label: "Contact", detail: "Contact details", documentation: 'Your contact details (Address, email, etc...)', kind: CompletionItemKind.Property });
    completions.push({ label: "TL", detail: "Top Left", documentation: "Additional content in the top left of the title page", kind: CompletionItemKind.Property });
    completions.push({ label: "TC", detail: "Top Center", documentation: "Additional content in the top center of the title page", kind: CompletionItemKind.Property });
    completions.push({ label: "TR", detail: "Top Right", documentation: "Additional content in the top right of the title page", kind: CompletionItemKind.Property });
    completions.push({ label: "CC", detail: "Center Center", documentation: "Additional content in the center of the title page", kind: CompletionItemKind.Property });
    completions.push({ label: "BL", detail: "Bottom Left", documentation: "Additional content in the bottom left of the title page", kind: CompletionItemKind.Property });
    completions.push({ label: "BR", detail: "Bottom Right", documentation: "Additional content in the bottom right of the title page", kind: CompletionItemKind.Property });
    completions.push({ label: 'Header', detail: "Header used throughout the document", documentation: "This will be printed in the top left of every single page, excluding the title page. Can also be set globally by the 'Page Header' setting", kind: CompletionItemKind.Property });
    completions.push({ label: 'Footer', detail: "Header used throughout the document", documentation: "This will be printed in the bottom left of every single page, excluding the title page. Can also be set globally by the 'Page Footer' setting", kind: CompletionItemKind.Property });

    return completions;
};

export class CompletionsProvider {
    constructor(private languageServer: { getParsedScript: (uri: string) => { lines: string[], script: FountainScript } }) { }

    public resolveCompletion(item: CompletionItem): CompletionItem {
        return item;
    };

    public handleCompletions(documentPosition: TextDocumentPositionParams): CompletionItem[] {
        const completions: CompletionItem[] = [];

        const { script: parsedScript, lines } = this.languageServer.getParsedScript(documentPosition.textDocument.uri)
        const currentLine = lines[documentPosition.position.line];

        // Blank page...
        if (lines.join("").trim().length === 0) {
            completions.push(...openingCompletions(currentLine, parsedScript));
            completions.push(...titlePageCompletions(currentLine, parsedScript));
            completions.push(...sceneCompletions(currentLine, parsedScript));
            return completions;
        }

        // Not a blank page.
        if (isTitlePage(documentPosition, parsedScript)) {
            completions.push(...titlePageCompletions(currentLine, parsedScript));
        } else {
            completions.push(...openingCompletions(currentLine, parsedScript));
            completions.push(...sceneCompletions(currentLine, parsedScript));
            completions.push(...characterCompletions(currentLine, parsedScript));
            completions.push(...dialogueCompletions(currentLine, parsedScript));
            completions.push(...transitionCompletions(currentLine, parsedScript));
            completions.push(...closingCompletions(currentLine, parsedScript));
        }
        return completions;
    };
}
