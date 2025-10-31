import { expect } from 'chai';
import { CompletionsProvider, characterCompletions, closingCompletions, dialogueCompletions, openingCompletions, sceneCompletions, titlePageCompletions, transitionCompletions } from "../src/completions";
import { parse } from 'fountain-parser';
import { trimIndent } from './trimIndent';

const sampleScript = trimIndent(`
Title: Title
Author: Pete

INT. MY SCENE
`);

const documents = [
    {
        uri: 'emptydocument',
        content: ""
    },
    {
        uri: 'titlepage',
        content: sampleScript
    }
];

const documentData = Object.fromEntries(documents.map(doc => ([doc.uri, {script: parse(doc.content), lines: doc.content.split('\n')}])));

const prov = new CompletionsProvider({
    getParsedScript(uri) {
        return documentData[uri];
    },
});


describe("Completions", () => {
    describe("handleCompletions", () => {
        it(`should return openings, title page and scene completions for an empty document`, async () => {
            const completions = prov.handleCompletions({ position: { character: 0, line: 0 }, textDocument: { uri: 'emptydocument' } });
            titlePageCompletions("", parse("")).forEach(completion => {
                expect(completions).to.deep.contain(completion);
            });
            sceneCompletions("", parse("")).forEach(completion => {
                expect(completions).to.deep.contain(completion);
            });
            openingCompletions("", parse("")).forEach(completion => {
                expect(completions).to.deep.contain(completion);
            });
        });

        it(`should return title page completions only if we're inside the title page`, async () => {
            const completions = prov.handleCompletions({ position: { character: 0, line: 0 }, textDocument: { uri: 'titlepage' } });
            expect(completions).to.deep.equal(titlePageCompletions(sampleScript.split('\n')[0], parse(sampleScript)));
        });

        it(`should return openings, scenes, characters, dialogue, transitions, and closings if past the title page`, async () => {
            const line = 'INT. MY SCENE';
            const scr = parse(sampleScript);
            const actual = prov.handleCompletions({ position: { character: 0, line: 3 }, textDocument: { uri: 'titlepage' } });
            const expected = [
                ...openingCompletions(line, scr),
                ...sceneCompletions(line, scr),
                ...characterCompletions(line, scr),
                ...dialogueCompletions(line, scr),
                ...transitionCompletions(line, scr),
                ...closingCompletions(line, scr)
            ];
            expect(actual).to.deep.equal(expected);
            const completionLabels = actual.map(it => it.label);
            expect(completionLabels).not.to.include("Title");
        });
    });
    describe("titlePageCompletions", () => {
        const allowedMultipleTimes = ['TL', 'TC', 'TR', 'CC', 'BL', 'BR', 'Header', 'Footer'];
        const disallowedMultipleTimes = [
            'Title',
            'Credit',
            'Author',
            'Source',
            'Notes',
            'Draft Date',
            'Date',
            'Copyright',
            'Watermark',
            'Font',
            'Revision',
        ];
        allowedMultipleTimes.forEach(attr => {
            it(`should return ${attr} when already in the title page`, async () => {
                const script = parse(trimIndent(`
                    ${attr}: Blah

                `));
                const actual = titlePageCompletions("", script);
                const completionLabels = actual.map(it => it.label);
                expect(completionLabels).to.include(attr);
                ['Author', 'Credit', 'Source'].filter(it => it != attr).forEach(label => {
                    expect(completionLabels).to.include(label);
                });
            });
        });
        disallowedMultipleTimes.forEach(attr => {
            it(`should not return ${attr} when already in the title page as it is expected at most once`, async () => {
                const script = parse(trimIndent(`
                    ${attr}: Blah

                `));
                const actual = titlePageCompletions("", script);
                const completionLabels = actual.map(it => it.label);
                expect(completionLabels).not.to.include(attr);
                ['Author', 'Credit', 'Source'].filter(it => it != attr).forEach(label => {
                    expect(completionLabels).to.include(label);
                });
            });
        });
    });
});
