const ffmpeg = require('ffmpeg');
const fetch = require('node-fetch');
const http = require('http');
const fs = require('fs');
const childProcess = require('child_process');

module.exports = class EncodingController {
    static async createMP4(audioFilename, videoFilename) {
        return new Promise(async (resolve, reject) => {
            const videoFileLocation = `files/${videoFilename}`;
            const audioFileLocation = `files/${audioFilename}`;
            childProcess.execSync(`ffmpeg -i ${videoFileLocation} -i ${audioFileLocation} -c:v copy -c:a aac output.mp4`);
            resolve();
        });
    }
}
