const path = require('path');
const { exec, execSync } = require('child_process');

module.exports = class EncodingController {
    static combineAudioAndVideo(audioURL, videoURL) {
        return new Promise((resolve, reject) => {
            console.log(videoURL);
            console.log(audioURL);
            const videoFilename = path.basename(videoURL);
            const outputLocation = `/tmp/transcoded/${videoFilename}`;
            console.log(outputLocation);
            try {
                exec(`ffmpeg -i ${videoURL} -i ${audioURL} -y -c:v libx264 -preset fast -c:a aac ${outputLocation}`, (err, stdout, stderr) => {
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
