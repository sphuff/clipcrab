# mv src/files/videow.ebm src/files/video.webm
# ffmpeg -i src/files/video.mp4 -c:v libx264 src/files/video264.mp4

# This is with vp9 (chrome only codec)
ffmpeg -i ../src/files/video.mp4 -i ../src/files/mmbam.mp3 -c:v copy -c:a aac ../output.mp4
# ffmpeg -i output.webm -preset superfast output.mp4
