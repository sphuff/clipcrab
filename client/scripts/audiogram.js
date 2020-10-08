const AudioContext = require('web-audio-api').AudioContext
const fs = require('fs');
const path = require('path');

class Audiogram {
    static async getAudiogramData() {
        const audioContext = new AudioContext();
        let currentBuffer = null;
        const filePath = path.join(__dirname, '../assets/mmbam.mp3');
        const audio = fs.readFileSync(filePath);
        console.log(audio);
        const arrayBuffer = await audioContext.decodeAudioData(audio);
        console.log(arrayBuffer);
    }
}

module.exports = Audiogram;