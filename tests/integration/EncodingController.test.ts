// const EncodingController = require('../../src/controllers/EncodingController');
// const fs = require('fs');
// const path = require('path');
// const { expect } = require('chai');
// const { getCodecsForFile }  = require('../helpers');

// const mp3 = '../fixtures/mmbam-wizard.mp3';
// const mp4 = '../fixtures/mmbam-wizardmp3-2020-09-30T203501300Z.mp4';

// describe('EncodingController', () => {
    
//     describe('createMP4',  function() {
//         this.timeout(5000);
//         it('should combine mp3 and mp4 into one file', async () => {
//             // path relative to EncodingController
//                 const audioPath = path.join(__dirname, '../integration/', mp3);
//                 const videoPath = path.join(__dirname, '../integration/', mp4);
//                 await EncodingController.combineAudioAndVideo(audioPath, videoPath)
//                 const outputPath = path.join(__dirname, `../../src/transcoded/mmbam-wizardmp3-2020-09-30T203501300Z.mp4`);
//                 console.log('out: ', outputPath);
//                 const fileExists = fs.existsSync(outputPath);
//                 expect(fileExists).to.equal(true);
    
//                 // const { audioCodec, videoCodec } = await getCodecsForFile(outputPath);
//                 // expect(audioCodec).to.equal('aac');
//                 // expect(videoCodec).to.equal('h264');
//                 // done();
//         });
//     });
// });