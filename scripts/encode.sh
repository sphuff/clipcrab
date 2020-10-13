# mv src/files/videow.ebm src/files/video.webm
# ffmpeg -i src/files/video.mp4 -c:v libx264 src/files/video264.mp4

# This is with vp9 (chrome only codec)
ffmpeg -i https://podcast-clipper.s3.amazonaws.com/uploads/mmbammp3-2020-10-12T235713533Z.mp4 -i https://podcast-clipper.s3.amazonaws.com/uploads/mmbam.mp3 -y -c:v libx264 -preset fast -c:a aac output.mp4
# ffmpeg -i output.webm -preset superfast output.mp4
