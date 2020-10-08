const expect = require('chai').expect;
const DescriptParser = require('../scripts/descript-parser');
const path = require('path');
const file = path.join(__dirname, '../assets/mmbam2.rtf');

describe('parse tests', () => {
    it('parse includes proper fields', async () => {
        const expectedFields = ['startsAtSecs', 'endsAtSecs', 'speaker', 'text'];
        const firstResult = (await DescriptParser.parse(file))[0];
        expect(firstResult).to.have.all.keys(expectedFields);
        expect(firstResult.startsAtSecs).to.be.a('number');
        expect(firstResult.endsAtSecs).to.be.a('number');
        expect(firstResult.speaker).to.be.a('string');
        expect(firstResult.text).to.be.a('string');
    });

    describe('timestamp tests', () => {
        it('get proper timestamp from line when 0', () => {
            const result = DescriptParser._getTimestampFromLine("Justin: [00:00:00] Let's see, what about Joseph? Joseph Jessup? Just up Jesse, the third mega");
            expect(result).to.equal(0);
        });

        it('get proper timestamp from line when secs', () => {
            const result = DescriptParser._getTimestampFromLine("Justin: [00:00:36] Let's see, what about Joseph? Joseph Jessup? Just up Jesse, the third mega");
            expect(result).to.equal(36);
        });

        it('get proper timestamp from line when min only', () => {
            const result = DescriptParser._getTimestampFromLine("Justin: [00:01:00] Let's see, what about Joseph? Joseph Jessup? Just up Jesse, the third mega");
            expect(result).to.equal(60);
        });

        it('get proper timestamp from line when hour and min only', () => {
            const result = DescriptParser._getTimestampFromLine("Justin: [01:01:00] Let's see, what about Joseph? Joseph Jessup? Just up Jesse, the third mega");
            expect(result).to.equal(3660);
        });
    });

    describe('speaker tests', () => {
        it('get proper speaker from line', () => {
            const result = DescriptParser._getSpeakerFromLine("Justin: [00:00:00] Let's see, what about Joseph? Joseph Jessup? Just up Jesse, the third mega");
            expect(result).to.equal('Justin');
        });
    });


    it('parse gives correct first segment', async () => {
        const firstResult = await DescriptParser.parse(file);

        const expectedValue = [{
            startsAtSecs: 0,
            endsAtSecs: 7, 
            speaker: 'Justin',
            text: 'Let\'s see, what about Joseph? Joseph Jessup? Just up Jesse, the third mega'
        }, {
            startsAtSecs: 7,
            endsAtSecs: 17, 
            speaker: 'Griffin',
            text: "mega. What do you, what about mega Jessup? Hey, who's that who's currently destroying our town. It is mega Jessup"
        }, {
            startsAtSecs: 17,
            endsAtSecs: 23, 
            speaker: 'Justin',
            text: "to be fair, how he starts out and then he becomes mega Jessup."
        }, {
            startsAtSecs: 23,
            endsAtSecs: 23, 
            speaker: 'Griffin',
            text: "Jessup."
        }, {
            startsAtSecs: 23,
            speaker: 'Justin',
            text: "Don't make him angry. You wouldn't like him when he's mega.\nUm, I'm just going to steer this out. Widen your scope. Um, yeah, maybe try some other names.\nOkay.",
        }];
        expect(firstResult).to.deep.equal(expectedValue);
    });
});