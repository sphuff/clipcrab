const path = require('path');
const fs = require('fs');
const { exec, execSync } = require('child_process');

module.exports = class EncodingController {
    static combineAudioAndVideo(audioURL, videoURL) {
        return new Promise((resolve, reject) => {
            console.log(videoURL);
            console.log(audioURL);
            const videoFilename = path.basename(videoURL);
            const dir = '/tmp/transcoded';
            if (!fs.existsSync(dir)){
                console.log('make dir', dir);
                fs.mkdirSync(dir);
                console.log('dir exists: ', fs.existsSync(dir));
            }
            const outputLocation = `${dir}/${videoFilename}`;
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
