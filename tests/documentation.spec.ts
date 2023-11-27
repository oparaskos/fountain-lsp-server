import { expect } from 'chai';
import { getDocumentation } from "../src/documentation";
import { readFileSync } from 'fs';

describe("Documentation", () => {
    const documentedTopics = [
        'action', 'lyrics', 'scene', 'title-page',
        'boneyard', 'notes', 'section', 'transition',
        'dialogue', 'page-break', 'synopses'];

    for (const topic of documentedTopics) {
        it(`should return the contents of 'syntax.${topic}.md' for '${topic}'`, async () => {
            const expected = { contents: readFileSync(`${__dirname}/../src/fountain-docs/syntax.${topic}.md`, 'utf-8').toString() }
            expect(await getDocumentation(topic)).to.deep.equal(expected);
        });
    }
});
