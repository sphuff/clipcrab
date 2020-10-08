import React, { Component } from 'react';
import AudiogramCanvas from '../../AudiogramCanvas';
import TextBlock from '../../TextBlock';
import Background from '../../Background';
import CoverImage from '../../CoverImage';
import TranscriptionInput from '../TransciptionInput';
import Timeline from '../Timeline';
import * as PIXI from 'pixi.js';
import EditorTray from '../EditorTray';

export default class Editor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hexColor: 0x1C396F,
            coverImage: null,
            seekTo: 0,
            restartSound: 0,
            app: null,
            finishedEncoding: false,
            textBlocks: [],
        };
    }

    async componentDidMount() {
        const { config: { layouts : { instagram: { width, height } } } } = this.props;
        const canvas = document.getElementById('myCanvas');
        // set resolution to avoid font blurring
        // NOTE: everything will need to be scaled by 0.5 to make up for resolution
        // PIXI.settings.RESOLUTION = 2;  
        const app = new PIXI.Application({
          width: width,
          height: height,
          backgroundColor: 0xFFFFFF,
          autoDensity: true,
          resolution: window.devicePixelRatio || 1, 
          view: canvas
        });
        app.stage.sortableChildren = true; // makes higher z-index in front
        
        this.setState({
          app: app,
        });
    }

    async selectedCoverImage(e, file) {
        console.log('selected cover image', e, file);
        if (!file) return;
        if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
          alert('Must enter image file');
          return;
        }
        console.log(e.currentTarget);
        this.setState({
          coverImage: URL.createObjectURL(file),
        });
    }

    onUpdateTextBlocks(textBlocks, seekTo) {
        this.setState({
          textBlocks,
          seekTo: seekTo,
        });
    }

    onColorSelect(hexColor) {
        this.setState({
          hexColor
        });
    }

    async recordVideo() {
        const { restartSound, sound, soundFile, uploadFile, serverAudioFileURL, encodeVideo } = this.props;
    
        if (this.recorderTimeout) {
          clearTimeout(this.recorderTimeout);
          this.recorderTimeout = null;
        }
        
        var options = {mimeType: 'video/webm; codecs=vp9'};
        const canvasEl = document.getElementById('myCanvas');
        if (!canvasEl) return;
    
        const frameRate = 60;
        const videoStream = canvasEl.captureStream(frameRate);
    
        // restart audio and text
        sound.play();
        this.setState({
          restartSound: restartSound + 1,
          seekTo: 0,
        });
        
        const mediaRecorder = new MediaRecorder(videoStream, options);
        let chunks = [];
        mediaRecorder.ondataavailable = e => {
          chunks.push(e.data); // gets called at end
          console.log('data avail: ', chunks);
        };
        // only when the recorder stops, we construct a complete Blob from all the chunks
        mediaRecorder.onstop = async e => {
          const videoBlob = new Blob(chunks, {
            type: 'video\/webm'
          });
          const date = new Date();
          const videoFile = new File([videoBlob], `${soundFile.name}-${date.toISOString()}.mp4`);
          const { serverFileURL: serverVideoFileURL } = await uploadFile(videoFile);
          this.setState({
            serverVideoFileURL: serverVideoFileURL,
          });
          await encodeVideo(serverAudioFileURL, serverVideoFileURL);
          this.clearVideoAndAudio();
        }
    
        mediaRecorder.start();
        const timeout = sound.duration * 1000;
        this.recorderTimeout = setTimeout(() => {
            mediaRecorder.stop();
        }, timeout);
    }

    clearVideoAndAudio() {
      const { app } = this.state;
      app.stage.visible = false;
      this.setState({
        finishedEncoding: true,
      });
    }

    render() {
        const { sound, wordBlocks, config: { fps, layouts : { instagram: { audiogram: audiogramProps, coverImage: coverImageProps, text: textProps }}} } = this.props;
        const { app, hexColor, textBlocks, coverImage, restartSound, seekTo, finishedEncoding } = this.state;

        return (
            <div className='editorContainer min-h-full min-w-full w-full flex flex-wrap self-stretch lg:grid lg:grid-cols-editor'>
                {/* <Timeline soundFileURL={soundFileURL} textBlocks={textBlocks} onSeek={this.onAudioSeek.bind(this)} duration={sound && sound.duration}/> */}
                { finishedEncoding && (
                  <div>Finished Encoding</div>
                )}
                <div className='flex-1 flex justify-center items-center'>
                  <div className='bg-gray-200 p-8'>
                    <canvas id="myCanvas" className='rounded shadow-lg'></canvas>
                  </div>
                </div>
                <EditorTray onRecord={this.recordVideo.bind(this)} onColorSelect={this.onColorSelect.bind(this)} hexColor={hexColor} onFileSelect={this.selectedCoverImage.bind(this)}/>
                {/* might need to render for sound loaded */}
                <TranscriptionInput soundLoaded={true} wordBlocks={wordBlocks} onUpdateTextBlocks={this.onUpdateTextBlocks.bind(this)}/>
                <Background pixiApp={app} hexColor={hexColor}/>
                <CoverImage pixiApp={app} {...coverImageProps} icon={coverImage}/>
                <TextBlock pixiApp={app} restartSound={restartSound} fps={fps} seekTo={seekTo} {...textProps} textBlocks={textBlocks}/>
                <AudiogramCanvas pixiApp={app} fps={fps} restartSound={restartSound} seekTo={seekTo} {...audiogramProps} sound={sound}/>
                {/* <Audiogram /> */}
            </div>
        );
    }
}