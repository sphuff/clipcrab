const { expect } = require('chai');
const { TranscriptionController } = require('../../src/controllers/TranscriptionController');
const mmbamJson = require('../fixtures/rev-ai-mmbam.json');

describe('TranscriptionController - Get word blocks from rev.ai transcription object', () => {
    it('Should have proper word block fields', () => {
        const { wordBlocks, text } = TranscriptionController._getWordBlocks(mmbamJson);
        expect(wordBlocks[0]).to.haveOwnProperty('text');
        expect(wordBlocks[0]).to.haveOwnProperty('endTime');
        expect(wordBlocks[0]).to.haveOwnProperty('startTime');
        expect(wordBlocks[0].text).to.equal("Let's");
        expect(text).to.equal(`Let's see, what about Joseph? Joseph Jessup? Just up Jesse, the third mega mega. What you, what about mega Jessup? Jessup? Hey, who's that? Who's currently destroying. It is mega Jessup to be fair is how he starts out. And then he becomes mega Jessup. Jessup. Don't make him angry. You wouldn't like him when he's mega. Mmm. I'm just going to steer this out. Why didn't your scope? Um, yeah, maybe try some other names. Okay.`);
    });
});