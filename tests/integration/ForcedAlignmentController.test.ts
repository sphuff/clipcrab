import { expect } from 'chai';
import * as path from 'path';
import * as fs from 'fs';
import ForcedAlignmentController from '../../src/controllers/ForcedAlignmentController';
// make relative to controller
const mp3Path = path.join(__dirname, '../fixtures/mmbam.mp3');
const transcriptionTextPath = path.join(__dirname, '../fixtures/mmbam.txt');

describe('ForcedAlignmentController', function () {
    this.timeout(50000);
    it.only('alignMedia', async () => {
        const transcriptionStream = fs.createReadStream(transcriptionTextPath);
        const audioStream = fs.createReadStream(mp3Path);
        const wordBlocks = await ForcedAlignmentController.getWordBlocksFromMediaStreams(transcriptionStream, audioStream);
        expect(wordBlocks).to.not.be.null;
        const firstBlock = wordBlocks[0];
        expect(firstBlock).to.haveOwnProperty('text');
        expect(firstBlock).to.haveOwnProperty('endTime');
        expect(firstBlock).to.haveOwnProperty('startTime');
        expect(firstBlock.text).to.equal(`Let's`);
    });
})