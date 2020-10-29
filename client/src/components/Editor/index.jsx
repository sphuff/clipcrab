import React, { Component } from 'react';
import AudiogramCanvas from '../../AudiogramCanvas';
import TextBlock from '../../TextBlock';
import Background from '../../Background';
import CoverImage from '../../CoverImage';
import TranscriptionInput from '../TransciptionInput';
import Timeline from '../Timeline';
import * as PIXI from 'pixi.js';
import EditorTray from '../EditorTray';
import LoadingIndicator from '../LoadingIndicator';

export default class Editor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hexColor: 0x1C396F,
            coverImage: null,
            backgroundImage: null,
            seekTo: 0,
            restartSound: 0,
            app: null,
            finishedEncoding: false,
            pauseTime: null,
            canvasWidth: null,
            canvasHeight: null,
            isRecording: false,
            loadingText: null,
            aspectRatio: 'square',
            textBlocks: [],
        };
    }

    async componentDidMount() {
        const { config: { layouts : { square: { width, height } } } } = this.props;
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
          backgroundImage: null,
        });
    }

    async selectedBackgroundImage(e, file) {
        console.log('selected background image', e, file);
        if (!file) return;
        if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
          alert('Must enter image file');
          return;
        }
        console.log(e.currentTarget);
        this.setState({
          backgroundImage: URL.createObjectURL(file),
          coverImage: null,
        });
    }

    onSelectAspectRatio(aspectRatio) {
      const { config: { layouts : { [aspectRatio]: { width, height }}} } = this.props;
      const { app } = this.state;
      app.renderer.resize(width, height);
      this.setState({
        aspectRatio,
      });
    }

    onUpdateTextBlocks(textBlocks, seekTo) {
      this.audioSeek(seekTo);
      this.setState({
        textBlocks,
      });
    }

    audioSeek(seekTo) {
      this.setState({
        seekTo,
        pauseTime: null,
      });
    }

    onColorSelect(hexColor) {
        this.setState({
          hexColor,
          backgroundImage: null,
          coverImage: null,
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
        
        // restart audio and text
        this.setState({
          restartSound: restartSound + 1,
          seekTo: 0,
          loadingText: 'Now recording. Please wait to complete',
          pauseTime: null,
          isRecording: true,
        }, () => {
          const videoStream = canvasEl.captureStream(frameRate);
          sound.play();

          const mediaRecorder = new MediaRecorder(videoStream, options);
          let chunks = [];
          mediaRecorder.ondataavailable = e => {
            chunks.push(e.data); // gets called at end
            console.log('data avail: ', chunks);
          };
          // only when the recorder stops, we construct a complete Blob from all the chunks
          mediaRecorder.onstop = async e => {
            const videoBlob = new Blob(chunks, {
              type: 'video/webm'
            });
            const date = new Date();
            const videoFile = new File([videoBlob], `${soundFile.name}-${date.toISOString()}.mp4`);
            const { s3FileURL: serverVideoFileURL } = await uploadFile(videoFile);
            this.setState({
              serverVideoFileURL: serverVideoFileURL,
              loadingText: 'Encoding video. Almost there.',
            });
            try {
              await encodeVideo(serverAudioFileURL, serverVideoFileURL);
              this.clearVideoAndAudio();
            } catch(err) {
              this.setState({
                isRecording: false,
              });
              this.pauseAudio();
            }
          }
      
          mediaRecorder.start();
          const timeout = sound.duration * 1000;
          this.recorderTimeout = setTimeout(() => {
              mediaRecorder.stop();
          }, timeout);
        });
    }



    playAudio() {
      if (this.state.pauseTime) {
        this.setState({
          pauseTime: null,
        }, () => {
          this.props.sound.resume();
        });
      }
    }

    pauseAudio() {
      const instance = this.props.sound.instances[0] ? this.props.sound.instances[0] : null;
      if (!instance) return;
      const { progress } = instance;
      const pauseTime = progress * this.props.sound.duration;
      // set seekTo for text animation when replayed
      this.setState({
        pauseTime: pauseTime,
        seekTo: pauseTime,
      }, () => {
        this.props.sound.pause();
      });
    }

    clearVideoAndAudio() {
      const { app } = this.state;
      app.stage.visible = false;
      this.setState({
        finishedEncoding: true,
        isRecording: false,
      });
    }

    requestTranscription() {
      const { soundFileURL, requestTranscription } = this.props;
      return requestTranscription(soundFileURL);
    }

    render() {
      const { app, hexColor, textBlocks, coverImage, loadingText, backgroundImage, pauseTime, restartSound, seekTo, isRecording, finishedEncoding, aspectRatio } = this.state;
      const { sound, soundFileURL, wordBlocks, loadedTranscription, config: { fps, layouts : { [aspectRatio]: { width, height, audiogram: audiogramProps, coverImage: coverImageProps, text: textProps }}} } = this.props;
      const isPlayingAudio = !(!!pauseTime);

      return (
          <div className='editorContainer min-h-full min-w-full w-full flex flex-wrap self-stretch lg:grid lg:grid-cols-editor lg:grid-rows-editor'>
              { finishedEncoding && (
                <div>Finished Encoding</div>
                )}
              { isRecording && (
                <div className='z-20 absolute top-0 h-screen w-screen bg-gray-500 bg-opacity-75 flex justify-center items-center'>
                  <div className='p-4 relative rounded bg-white'>
                    <LoadingIndicator text={loadingText} />
                  </div>
                </div>
              )}
              <div className='flex-1 flex justify-center items-center'>
                <canvas id="myCanvas" className='m-8 rounded shadow-lg max-h-full'></canvas>
              </div>
              <EditorTray onRecord={this.recordVideo.bind(this)} aspectRatio={aspectRatio} onColorSelect={this.onColorSelect.bind(this)} hexColor={hexColor} onCoverImageSelect={this.selectedCoverImage.bind(this)} onBackgroundImageSelect={this.selectedBackgroundImage.bind(this)} onSelectAspectRatio={this.onSelectAspectRatio.bind(this)}/>
              <Timeline soundFileURL={soundFileURL} isPlayingAudio={isPlayingAudio} textBlocks={textBlocks} onSeek={this.audioSeek.bind(this)} playAudio={this.playAudio.bind(this)} pauseAudio={this.pauseAudio.bind(this)} duration={sound && sound.duration}/>
              {/* might need to render for sound loaded */}
              <TranscriptionInput soundLoaded={true} wordBlocks={wordBlocks} onUpdateTextBlocks={this.onUpdateTextBlocks.bind(this)} requestTranscription={this.requestTranscription.bind(this)} loadedTranscription={loadedTranscription}/>
              <Background stage={app && app.stage} width={width} height={height} hexColor={hexColor} backgroundImage={backgroundImage}/>
              <CoverImage pixiApp={app} {...coverImageProps} icon={coverImage}/>
              <TextBlock pixiApp={app} fps={fps} seekTo={seekTo} {...textProps} textBlocks={textBlocks} pauseAt={pauseTime}/>
              <AudiogramCanvas pixiApp={app} fps={fps} aspectRatio={aspectRatio} restartSound={restartSound} seekTo={seekTo} {...audiogramProps} sound={sound} pauseAt={pauseTime}/>
              {/* <Audiogram /> */}
          </div>
      );
    }
}