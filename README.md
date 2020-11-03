## Current Process
* Run web app - drag and drop mp3, which adds audio to application/creates waveform
* Manually edit video text
* Press capture to capture video and upload to server
* Run `ffmpeg -i src/files/video.mp4 -i src/files/mmbam.mp3 -c:v copy -c:a aac output.mp4` to combine audio and video
* Use generic 1080p setup in Elastic Transcoder to transform to aac/h264

## Forced Alignment
The alignment service is currently hosted on a digital ocean droplet.