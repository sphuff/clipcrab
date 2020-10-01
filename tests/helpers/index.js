var ffmpeg = require('fluent-ffmpeg');

const getCodecsForFile = (path) => 
    new Promise((resolve, reject) => {
        let audioCodec;
        let videoCodec;
        ffmpeg.ffprobe(path,function(err, metadata) {
            console.log(metadata);
            metadata.streams.forEach(function(stream){
                if (stream.codec_type === "video")
                    videoCodec = stream.codec_name;
                else if (stream.codec_type === "audio")
                    audioCodec = stream.codec_name;
            });
        
            console.log("Video codec: %s\nAudio codec: %s", videoCodec, audioCodec);
            resolve({ audioCodec, videoCodec });
        });
    });


module.exports = {
    getCodecsForFile,
}