import path from 'path';
import { readFile, stat } from 'fs/promises';
import { logger } from './logger';
import { Hover } from 'vscode-languageserver';
import { memoize } from 'memoize-utils/decorator';

const EMPTY_DOCS = {
    contents: ""
};

export class DocumentationProvider {
    constructor(private docsFolderPath = path.normalize(path.join(__dirname, 'fountain-docs'))) { }

    @memoize()
    async getDocumentation(topic: string): Promise<Hover> {
        try {
            const documentPath = path.join(this.docsFolderPath, `syntax.${topic}.md`);
            try {
                if ((await stat(documentPath)).isFile()) {
                    const buf = await readFile(documentPath, 'utf8')
                    return { contents: buf.toString() };
                }
            } catch (e) {
                logger.trace(`No doc file at ${documentPath}`);
            }
            return EMPTY_DOCS;
        } catch (e: unknown) {
            logger.error('Could not load documentation', e);
            return EMPTY_DOCS;
        }
    }
}
