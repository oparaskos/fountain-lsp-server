import {
    Connection,
    InitializeParams,
    DidChangeWatchedFilesParams,
    DidChangeConfigurationParams,
    HoverParams,
    CodeLensParams,
    CodeLens,
    CompletionParams,
    CompletionItem,
    InitializeResult,
    TextDocumentSyncKind,
    WorkspaceFoldersChangeEvent,
    FileChangeType,
    TextDocuments,
    Diagnostic
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { CharacterStats, FountainScript, parse } from 'fountain-parser';
import { CompletionsProvider } from './completions';
import { ExtensionSettings } from './ExampleSettings';
import { handleCodeLens, resolveCodeLens } from './lenses';
import { logger } from './logger';
import { enrichCharacterStats } from './config/enrichCharacterStats';
import { clearConfigCache, getConfig } from './config';
import { DocumentationProvider } from './documentation';

export class FountainLanguageServer {

    public hasConfigurationCapability = false;
    public hasWorkspaceFolderCapability = false;

    private static DEFAULT_SETTINGS: ExtensionSettings = { guessCharacterGenders: true };
    private static GLOBAL_SETTINGS: ExtensionSettings = this.DEFAULT_SETTINGS;

    // Cache the settings of all open documents
    private documentSettings: Map<string, Thenable<ExtensionSettings>> = new Map();

    private parsedDocuments: { [uri: string]: FountainScript; } = {};
    private lines: { [uri: string]: string[]; } = {};

    private documentationProvider = new DocumentationProvider();
    private completionsProvider = new CompletionsProvider(this);

    constructor(private connection: Connection, private documents: TextDocuments<TextDocument>) {
        // Only keep settings for open documents
    }

    public handleDocumentClose(e: { document: { uri: string; }; }) {
        this.documentSettings.delete(e.document.uri);
    }

    public handleDocumentChange(change: { document: TextDocument; }) {
        this.validateTextDocument(change.document);
    }

    public doInitialize = (params: InitializeParams) => {
        const capabilities = params.capabilities;

        // Does the client support the `workspace/configuration` request?
        // If not, we fall back using global settings.
        this.hasConfigurationCapability = !!(
            capabilities.workspace && !!capabilities.workspace.configuration
        );
        this.hasWorkspaceFolderCapability = !!(
            capabilities.workspace && !!capabilities.workspace.workspaceFolders
        );

        const result: InitializeResult = {
            capabilities: {
                textDocumentSync: TextDocumentSyncKind.Incremental,
                hoverProvider: true,
                declarationProvider: true,
                codeLensProvider: {
                    resolveProvider: true
                },
                // documentSymbolProvider: true,
                // Tell the client that this server supports code completion.
                completionProvider: {
                    resolveProvider: true
                }
            }
        };
        if (this.hasWorkspaceFolderCapability) {
            result.capabilities.workspace = {
                workspaceFolders: {
                    supported: true
                }
            };
        }
        return result;
    };

    public handleChangeWorkspaceFolders(params: WorkspaceFoldersChangeEvent) {
        logger.log('Workspace folder change event received.', params);
    }

    public handleConfigurationChange(change: DidChangeConfigurationParams) {
        if (this.hasConfigurationCapability) {
            // Reset all cached document settings
            this.documentSettings.clear();
        } else {
            FountainLanguageServer.GLOBAL_SETTINGS = <ExtensionSettings>(
                (change.settings.languageServerExample || FountainLanguageServer.DEFAULT_SETTINGS)
            );
        }

        // Revalidate all open text documents
        this.documents.all().forEach((doc) => this.validateTextDocument(doc));
    }
    
    public async handleWatchedFilesChanged(params: DidChangeWatchedFilesParams) {
        logger.trace('We received an file change event');
    
        // process each change
        params.changes.forEach(change => {
            switch (change.type) {
                case FileChangeType.Deleted:
                    if (this.parsedDocuments[change.uri]) {
                        delete this.parsedDocuments[change.uri];
                    }
                    if (this.lines[change.uri]) {
                        delete this.lines[change.uri];
                    }
                    break;
            }
            if (change.uri.includes('.fountainrc')) clearConfigCache();
        });
    
    }
    
    public async handleHover(params: HoverParams) {
        const uri = params.textDocument.uri;
        const parsedScript = this.parsedDocuments[uri];
        const hoveredElements = parsedScript.getElementsByPosition(params.position);
        if (hoveredElements.length > 0) {
            const deepestHoveredElement = hoveredElements[hoveredElements.length - 1];
            return await this.documentationProvider.getDocumentation(deepestHoveredElement.type);
        }
        return null;
    }
    
    public handleCodeLens(params: CodeLensParams) { return handleCodeLens(this.parsedDocuments, this.lines, params); }

    public async resolveCodeLens(lens: CodeLens) {
        const settings = await this.getDocumentSettings(lens.data.uri);
        return resolveCodeLens(this.parsedDocuments, this.lines, settings, lens);
    }

    public handleCompletions(params: CompletionParams) {
        return this.completionsProvider.handleCompletions(params);
    }

    public resolveCompletion(completion: CompletionItem) {
        return this.completionsProvider.resolveCompletion(completion);
    }

    public async onCharactersStatsRequest(params: {uri: string}) {
        try {
            const settings = await this.getDocumentSettings(params.uri);
            const parsedScript = this.parsedDocuments[params.uri];
            const result: CharacterStats[] = parsedScript.statsPerCharacter;
            if (settings.guessCharacterGenders) {
                const fountainrc = await getConfig(params.uri);
                return result.map((it) => enrichCharacterStats(it, fountainrc));
            }
            return result;
        } catch (e: unknown) {
            logger.error(e);
        }
    }

    public async onLocationsStatsRequest(params:  {uri: string}) {
        const parsedScript = this.parsedDocuments[params.uri];
        const result = parsedScript.statsPerLocation;
        return result;
    }

    public async onScenesStatsRequest(params:  {uri: string}) {
        const parsedScript = this.parsedDocuments[params.uri];
        const result = parsedScript.statsPerScene;
        return result;
    }

    public async onDocumentStatsRequest(params:  {uri: string}) {
        const parsedScript = this.parsedDocuments[params.uri];
        const countedLines = this.lines[params.uri].filter(line => line.replace(/[^\w]+/,'').trim().length > 0);

        return {
            NumPages: naiveNumPages(parsedScript),
            NumWords: countedLines.map(line => line.split(' ').length).reduce((a, b) => a + b, 0),
            NumLines: countedLines.length
        };
    }

    public async getDocumentSettings(resource: string): Promise<ExtensionSettings> {
        if (!this.hasConfigurationCapability) {
            return Promise.resolve(FountainLanguageServer.GLOBAL_SETTINGS);
        }
        let result = this.documentSettings.get(resource);
        if (!result) {
            result = this.connection.workspace.getConfiguration({
                scopeUri: resource,
                section: 'fountain'
            });
            this.documentSettings.set(resource, result);
        }
        return result.then(it => it || FountainLanguageServer.GLOBAL_SETTINGS);
    }
    
    private async validateTextDocument(textDocument: TextDocument): Promise<void> {
        // In this simple example we get the settings for every validate run.
        // const settings = await getDocumentSettings(textDocument.uri);
        // The validator creates diagnostics for all uppercase words length 2 and more
        const text = textDocument.getText();
        this.lines[textDocument.uri] = text.split(/\r\n|\n\r|\n|\r/);
        // Parse the document.
        const parsedScript = parse(text);
        this.parsedDocuments[textDocument.uri] = parsedScript;
    
        const diagnostics: Diagnostic[] = [];
    
        // Send the computed diagnostics to VSCode.
        this.connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
    }

    public getParsedScript(textDocumentUri: string): {lines: string[], script: FountainScript} {
        return {
            script: this.parsedDocuments[textDocumentUri],
            lines: this.lines[textDocumentUri]
        };
    }
}

/**
 * Estimate number of pages of the script assuming no manual page breaks, a monospaced font and no extra whitespace and whatnot.
 */
function naiveNumPages(parsedScript: FountainScript) {
    const actionWidth = 80;
    const dialogueWidth = 40;
    const actionCharactersPerSecond = 20;
    const pageHeight = 40;

    const numDialoguePageLines = parsedScript.dialogue.map(d => (
        1 + // Character line
        (d.parenthetical ? 1 : 0) + // assume parenthetical is one line
        Math.ceil(d.words.join(' ').length / dialogueWidth) // 1 line for every 40 characters of dialogue
    )).reduce((a, b) => a + b, 0);

    const numPageLines = numDialoguePageLines + parsedScript.scenes.map(s => (
        1 + // INT. BLAH - DAY
        Math.ceil((s.actionDuration * actionCharactersPerSecond) / actionWidth)
    )).reduce((a, b) => a + b, 0);

    return 1 + Math.ceil(numPageLines / pageHeight);// assume title page is one page.
}

