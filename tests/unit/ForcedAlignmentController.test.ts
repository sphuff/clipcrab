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
    it(`shouldn't return blocks if they don't have start or end times`, () => {
        const gentleWords: GentleWord[] = [{
            alignedWord: 'test',
            case: GentleCase.Success,
            end: undefined,
            start: undefined,
            endOffset: 0,
            startOffset: 0,
            word: 'test',
        }];
        const wordBlocks = ForcedAlignmentController._getWordBlocks(gentleWords);
        expect(wordBlocks.length).to.equal(0);
    });
});