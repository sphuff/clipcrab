const path = require('path');
const { exec, execSync } = require('child_process');

module.exports = class EncodingController {
    static combineAudioAndVideo(audioPath, videoPath) {
        return new Promise((resolve, reject) => {
            console.log(videoPath);
            console.log(audioPath);
            const videoFilename = path.basename(videoPath);
            const outputLocation = path.join(__dirname, `../transcoded/${videoFilename}`);
            console.log(outputLocation);
            try {
                exec(`ffmpeg -i ${videoPath} -i ${audioPath} -y -c:v libx264 -preset fast -c:a aac ${outputLocation}`, (err, stdout, stderr) => {
                    console.log(stdout);
                    console.log(stderr)
                    resolve(outputLocation);
                });
            } catch(err) {
                reject(err);
            }
        });
    }
}
