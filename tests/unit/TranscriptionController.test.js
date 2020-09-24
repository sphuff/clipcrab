const { expect } = require('chai');
const TranscriptionController = require('../../src/controllers/TranscriptionController');
const mmbamJson = require('../fixtures/rev-ai-mmbam.json');

describe('Get word blocks from rev.ai transcription object', () => {
    it('Should have proper word block fields', () => {
        const wordBlocks = TranscriptionController._getWordBlocks(mmbamJson);
        expect(wordBlocks[0]).to.haveOwnProperty('text');
        expect(wordBlocks[0]).to.haveOwnProperty('endTime');
        expect(wordBlocks[0]).to.haveOwnProperty('startTime');
        expect(wordBlocks[0].text).to.equal("Let's");
    });
});