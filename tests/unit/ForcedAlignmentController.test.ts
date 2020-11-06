import { expect } from 'chai';
import ForcedAlignmentController from '../../src/controllers/ForcedAlignmentController';
import { GentleCase, GentleWord } from '../../src/types/Gentle';
const gentleResponse = require('../fixtures/gentle-forced-alignment.json');

describe('ForcedAlignmentController - get word blocks from Gentle response', () => {
    it('should return default fields from single Gentle word', () => {
        const gentleWords: GentleWord[] = [{
            alignedWord: 'test',
            case: GentleCase.Success,
            end: 1.0,
            start: 0.0,
            endOffset: 4,
            startOffset: 0,
            word: 'test',
        }];
        const wordBlocks = ForcedAlignmentController._getWordBlocks(gentleWords, 'test');
        expect(wordBlocks.length).to.equal(1);
        expect(wordBlocks[0].startTime).to.equal(0.0);
        expect(wordBlocks[0].endTime).to.equal(1.0);
        expect(wordBlocks[0].text).to.equal('test');
    });
    
    it(`should extrapolate start time from nearest neighbor`, () => {
        const gentleWords: GentleWord[] = [{
            alignedWord: 'test1',
            case: GentleCase.Success,
            end: 1.0,
            start: undefined,
            endOffset: 5,
            startOffset: 0,
            word: 'test1',
        }, {
            alignedWord: 'test2',
            case: GentleCase.Success,
            end: 2.0,
            start: 1.0,
            endOffset: 11,
            startOffset: 6,
            word: 'test2',
        }, {
            alignedWord: 'test3',
            case: GentleCase.Success,
            end: 3.0,
            start: 2.0,
            endOffset: 17,
            startOffset: 12,
            word: 'test3',
        }];
        const wordBlocks = ForcedAlignmentController._getWordBlocks(gentleWords, 'test1 test2 test3');
        expect(wordBlocks.length).to.equal(3);
        const firstBlock = wordBlocks[0];
        expect(firstBlock.text).to.equal('test1');
        expect(wordBlocks[1].text).to.equal('test2');
        expect(wordBlocks[2].text).to.equal('test3');
        expect(firstBlock.startTime).to.equal(0.0);
    });

    it(`should extrapolate end time from nearest neighbor`, () => {
        const gentleWords: GentleWord[] = [{
            alignedWord: 'test1',
            case: GentleCase.Success,
            end: undefined,
            start: 0.0,
            endOffset: 5,
            startOffset: 0,
            word: 'test1',
        }, {
            alignedWord: 'test2',
            case: GentleCase.Success,
            end: 2.0,
            start: 1.0,
            endOffset: 11,
            startOffset: 6,
            word: 'test2',
        }, {
            alignedWord: 'test3',
            case: GentleCase.Success,
            end: 3.0,
            start: 2.0,
            endOffset: 17,
            startOffset: 12,
            word: 'test3',
        }];
        const wordBlocks = ForcedAlignmentController._getWordBlocks(gentleWords, 'test1 test2 test3');
        expect(wordBlocks.length).to.equal(3);
        const firstBlock = wordBlocks[0];
        expect(firstBlock.text).to.equal('test1');
        expect(wordBlocks[1].text).to.equal('test2');
        expect(wordBlocks[2].text).to.equal('test3');
        expect(firstBlock.endTime).to.equal(1.0);
    });

    it(`should extrapolate start and end times from nearest neighbor, even if not matched`, () => {
        const gentleWords: GentleWord[] = [{
            alignedWord: 'test1',
            case: GentleCase.Success,
            end: 1.0,
            start: 0.0,
            endOffset: 5,
            startOffset: 0,
            word: 'test1',
        }, {
            alignedWord: 'test2',
            case: GentleCase.NotFoundInAudio,
            endOffset: 11,
            startOffset: 6,
            word: 'test2',
        }, {
            alignedWord: 'test3',
            case: GentleCase.Success,
            end: 3.0,
            start: 2.0,
            endOffset: 17,
            startOffset: 12,
            word: 'test3',
        }];
        const wordBlocks = ForcedAlignmentController._getWordBlocks(gentleWords, 'test1 test2 test3');
        expect(wordBlocks.length).to.equal(3);
        const firstBlock = wordBlocks[0];
        expect(firstBlock.text).to.equal('test1');
        expect(wordBlocks[1].text).to.equal('test2');
        expect(wordBlocks[2].text).to.equal('test3');
        expect(wordBlocks[1].startTime).to.equal(1.0);
        expect(wordBlocks[1].endTime).to.equal(2.0);
    });

    it(`should include punctuation`, () => {
        const gentleWords: GentleWord[] = gentleResponse.words;
        const wordBlocks = ForcedAlignmentController._getWordBlocks(gentleWords, gentleResponse.transcript);
        expect(wordBlocks.length).to.equal(77);
        const firstBlock = wordBlocks[0];
        const firstSentence = wordBlocks.slice(0, 5);
        expect(firstBlock.text).to.equal(`Let's`);
        expect(firstSentence.map(block => block.text).join(' ')).to.equal(`Let's see, what about Joseph?`);
        const lastBlock = wordBlocks[wordBlocks.length - 1];
        expect(lastBlock.text).to.equal('Okay.');
        expect(lastBlock.startTime).to.equal(36.034999);
        expect(lastBlock.endTime).to.equal(36.299999);
        
    });
});