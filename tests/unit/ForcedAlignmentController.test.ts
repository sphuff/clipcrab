import { expect } from 'chai';
import ForcedAlignmentController, { GentleWord, GentleCase } from '../../src/controllers/ForcedAlignmentController';

describe('ForcedAlignmentController - get word blocks from Gentle response', () => {
    it('should return default fields from single Gentle word', () => {
        const gentleWords: GentleWord[] = [{
            alignedWord: 'test',
            case: GentleCase.Success,
            end: 1.0,
            start: 0.0,
            endOffset: 0,
            startOffset: 0,
            word: 'test',
        }];
        const wordBlocks = ForcedAlignmentController._getWordBlocks(gentleWords);
        expect(wordBlocks.length).to.equal(1);
        expect(wordBlocks[0].startTime).to.equal(0.0);
        expect(wordBlocks[0].endTime).to.equal(1.0);
        expect(wordBlocks[0].text).to.equal('test');
    });
    it.only(`should extrapolate start time from nearest neighbor`, () => {
        const gentleWords: GentleWord[] = [{
            alignedWord: 'test1',
            case: GentleCase.Success,
            end: 1.0,
            start: undefined,
            endOffset: 0,
            startOffset: 0,
            word: 'test1',
        }, {
            alignedWord: 'test2',
            case: GentleCase.Success,
            end: 2.0,
            start: 1.0,
            endOffset: 0,
            startOffset: 0,
            word: 'test2',
        }, {
            alignedWord: 'test3',
            case: GentleCase.Success,
            end: 3.0,
            start: 2.0,
            endOffset: 0,
            startOffset: 0,
            word: 'test3',
        }];
        const wordBlocks = ForcedAlignmentController._getWordBlocks(gentleWords);
        expect(wordBlocks.length).to.equal(3);
        const firstBlock = wordBlocks[0];
        expect(firstBlock.text).to.equal('test1');
        expect(firstBlock.startTime).to.equal(0.0);
    });

    it.only(`should extrapolate end time from nearest neighbor`, () => {
        const gentleWords: GentleWord[] = [{
            alignedWord: 'test1',
            case: GentleCase.Success,
            end: undefined,
            start: 0.0,
            endOffset: 0,
            startOffset: 0,
            word: 'test1',
        }, {
            alignedWord: 'test2',
            case: GentleCase.Success,
            end: 2.0,
            start: 1.0,
            endOffset: 0,
            startOffset: 0,
            word: 'test2',
        }, {
            alignedWord: 'test3',
            case: GentleCase.Success,
            end: 3.0,
            start: 2.0,
            endOffset: 0,
            startOffset: 0,
            word: 'test3',
        }];
        const wordBlocks = ForcedAlignmentController._getWordBlocks(gentleWords);
        expect(wordBlocks.length).to.equal(3);
        const firstBlock = wordBlocks[0];
        expect(firstBlock.text).to.equal('test1');
        expect(firstBlock.endTime).to.equal(1.0);
    });
});