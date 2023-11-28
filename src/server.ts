import {
    createConnection,
    DidChangeConfigurationNotification,
    DidChangeWorkspaceFoldersNotification,
    ProposedFeatures,
    TextDocuments,
} from 'vscode-languageserver/node';

import { logger } from './logger';
import { FountainLanguageServer } from './FountainLanguageServer';
import { TextDocument } from 'vscode-languageserver-textdocument';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
export const connection = createConnection(ProposedFeatures.all);
logger.connection = connection;

const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
const server = new FountainLanguageServer(connection, documents);

connection.onInitialize((params) => server.doInitialize(params));
connection.onInitialized(() => {
    if (server.hasConfigurationCapability) connection.client.register(DidChangeConfigurationNotification.type, undefined);
    if (server.hasWorkspaceFolderCapability) connection.client.register(DidChangeWorkspaceFoldersNotification.type, undefined);
    connection.workspace.onDidChangeWorkspaceFolders((params) => server.handleChangeWorkspaceFolders(params));
});
connection.onDidChangeConfiguration((change) => server.handleConfigurationChange(change));
connection.onDidChangeWatchedFiles(params => server.handleWatchedFilesChanged(params));
connection.onHover((params) => server.handleHover(params));
connection.onCodeLens((params) => server.handleCodeLens(params));
connection.onCodeLensResolve((params) => server.resolveCodeLens(params));
connection.onCompletion(params => server.handleCompletions(params));
connection.onCompletionResolve((params) => server.resolveCompletion(params));

connection.onRequest("fountain.statistics.characters", (params) => server.onCharactersStatsRequest(params));
connection.onRequest("fountain.statistics.locations", (params) => server.onLocationsStatsRequest(params));
connection.onRequest("fountain.statistics.scenes", (params) => server.onScenesStatsRequest(params));
connection.onRequest("fountain.statistics.document", (params) => server.onDocumentStatsRequest(params));

connection.onRequest((params) => {
    logger.warn('Unexpected, unhandled request', params);
});


documents.onDidClose(e => server.handleDocumentClose(e));
documents.onDidChangeContent(change => server.handleDocumentChange(change));

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();

