import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';

export default class EncodingController {
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
                const ffmpeg = spawn('ffmpeg', [
                    '-i', videoURL,
                    '-i', audioURL,
                    '-y',
                    '-c:v',
                    'libx264',
                    '-preset',
                    'fast',
                    '-c:a',
                    'aac',
                    outputLocation,
                ]);
                ffmpeg.stdout.setEncoding('utf8');
                ffmpeg.stdout.on('data', (message) => {
                    console.log(message.toString());
                });
                ffmpeg.on('close', () => {
                    console.log('done encoding', outputLocation);
                    resolve(outputLocation);
                });
                ffmpeg.stderr.on('data', (err)  => {
                    // no idea why, but data coming through stderr
                    console.log(err.toString());
                });
                ffmpeg.stderr.on('error', (err)  => {
                    console.error('ffmpeg error: ', err);
                    reject(err);
                });
            } catch(err) {
                reject(err);
            }
        });
    }
}
