import { expect } from 'chai';
import { Connection, TextDocuments } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { FountainLanguageServer } from '../src/FountainLanguageServer';

describe('FountainLanguageServer settings', () => {
    it('merges empty document settings with the defaults', async () => {
        const connection = {
            workspace: {
                getConfiguration: async () => ({})
            }
        } as unknown as Connection;

        const documents = {} as TextDocuments<TextDocument>;
        const server = new FountainLanguageServer(connection, documents);

        server.hasConfigurationCapability = true;

        const settings = await server.getDocumentSettings('file:///test.fountain');

        expect(settings.guessCharacterGenders).to.equal(true);
    });
});
