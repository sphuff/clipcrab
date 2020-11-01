const { expect } = require('chai');
const ForcedAlignmentController = require('../../src/controllers/ForcedAlignmentController');

describe('ForcedAlignmentController', () => {
    it('alignMedia', () => {
        const text = 'hi there';
        const wordBlocks = ForcedAlignmentController.getWordBlocksFromMedia(text);
        expect(wordBlocks).to.not.be.null;
        const firstBlock = wordBlocks[0];
        expect(firstBlock).to.haveOwnProperty('text');
        expect(firstBlock).to.haveOwnProperty('endTime');
        expect(firstBlock).to.haveOwnProperty('startTime');
        expect(firstBlock.text).to.equal(text);
    });
})