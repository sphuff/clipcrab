const expect = require('chai').expect;
const Audiogram = require('../scripts/audiogram');
const path = require('path');
const file = path.join(__dirname, '../assets/mmbam2.rtf');

describe.only('getAudiogramData tests', () => {
    it('getAudiogramData includes proper fields', async () => {
        const result = await Audiogram.getAudiogramData();
        expect(result).to.equal(true);
    });
});