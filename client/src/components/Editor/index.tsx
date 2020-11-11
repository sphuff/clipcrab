import React, { ChangeEvent, Component } from 'react';
import AudiogramCanvas from '../../AudiogramCanvas';
import TextBlock from '../../TextBlock';
import Background from '../../Background';
import CoverImage from '../../CoverImage';
import TranscriptionInput from '../TransciptionInput';
import Timeline from '../Timeline';
import * as PIXI from 'pixi.js';
import EditorTray from '../EditorTray';
import LoadingIndicator from '../LoadingIndicator';
import { Config, DisplayType } from '../../types/config';

type Props = {
  sound: any,
  soundFile: any,
  soundFileURL: string,
  wordBlocks: any,
  config: Config,
  aspectRatio: DisplayType,
  finishedEncoding: boolean,
  uploadFile: Function,
  encodeVideo: Function,
  serverAudioFileURL: string,
  loadedTranscription: boolean,
  transcribedText: string,
  alignedTranscription: boolean,
  alignTranscription: Function,
  requestTranscription: Function,
  onSelectAspectRatio: Function,
}
type State = {
  app: any,
  hexColor: number,
  textBlocks: any,
  coverImage?: string,
  loadingText?: string,
  backgroundImage?: string,
  pauseTime?: number,
  restartSound: number,
  seekTo: number,
  isRecording: boolean,
  finishedEncoding: boolean,
}

export default class Editor extends Component<Props,State>  {
    recorderTimeout?: number = undefined;

    constructor(props: Props) {
        super(props);
        this.state = {
            hexColor: 0x1C396F,
            coverImage: undefined,
            backgroundImage: undefined,
            seekTo: 0,
            restartSound: 0,
            app: undefined,
            finishedEncoding: false,
            pauseTime: undefined,
            isRecording: false,
            loadingText: undefined,
            textBlocks: [],
        };
    }

    async componentDidMount() {
        const { config: { layouts : { square: { width, height } } } } = this.props;
        const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
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

    async selectedCoverImage(e: ChangeEvent, file: File) {
        console.log('selected cover image', e, file);
        if (!file) return;
        if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
          alert('Must enter image file');
          return;
        }
        console.log(e.currentTarget);
        this.setState({
          coverImage: URL.createObjectURL(file),
          backgroundImage: undefined,
        });
    }

    async selectedBackgroundImage(e: ChangeEvent, file: File) {
        console.log('selected background image', e, file);
        if (!file) return;
        if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
          alert('Must enter image file');
          return;
        }
        console.log(e.currentTarget);
        this.setState({
          backgroundImage: URL.createObjectURL(file),
          coverImage: undefined,
        });
    }

    onSelectAspectRatio(aspectRatio: DisplayType) {
      const { onSelectAspectRatio, config: { layouts : { [aspectRatio]: { width, height }}} } = this.props;
      const { app } = this.state;
      app.renderer.resize(width, height);
      onSelectAspectRatio(aspectRatio);
    }

    onUpdateTextBlocks(textBlocks: any, seekTo: number) {
      this.audioSeek(seekTo);
      this.setState({
        textBlocks,
      });
    }

    audioSeek(seekTo: number) {
      this.setState({
        seekTo,
        pauseTime: undefined,
      });
    }

    onColorSelect(hexColor: number) {
        this.setState({
          hexColor,
          backgroundImage: undefined,
          coverImage: undefined,
        });
    }

    async recordVideo() {
        const { sound, soundFile, uploadFile, serverAudioFileURL, encodeVideo } = this.props;
        const { restartSound } = this.state;
    
        if (this.recorderTimeout) {
          clearTimeout(this.recorderTimeout);
          this.recorderTimeout = undefined;
        }
        
        var options = {mimeType: 'video/webm; codecs=vp8'};
        const canvasEl = document.getElementById('myCanvas') as HTMLCanvasElement;
        if (!canvasEl) return;
    
        const frameRate = 60;
        
        // restart audio and text
        this.setState({
          restartSound: restartSound + 1,
          seekTo: 0,
          loadingText: 'Now recording. Please wait to complete',
          pauseTime: undefined,
          isRecording: true,
        }, () => {
          // @ts-ignore
          const videoStream = canvasEl.captureStream(frameRate);
          sound.play();

          const mediaRecorder = new MediaRecorder(videoStream, options);
          let chunks: Blob[] = [];
          mediaRecorder.ondataavailable = e => {
            chunks.push(e.data); // gets called at end
            console.log('data avail: ', chunks);
          };
          // only when the recorder stops, we construct a complete Blob from all the chunks
          mediaRecorder.onstop = async e => {
            const videoBlob = new Blob(chunks, {
              type: 'video/mp4'
            });
            const date = new Date();
            const videoFile = new File([videoBlob], `${soundFile.name}-${date.toISOString()}.mp4`);
            const { s3FileURL: serverVideoFileURL } = await uploadFile(videoFile);
            this.setState({
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
          // @ts-ignore
          this.recorderTimeout = setTimeout(() => {
              mediaRecorder.stop();
          }, timeout);
        });
    }

    componentWillUnmount() {
      this.clearVideoAndAudio();
      this.pauseAudio();
    }


    playAudio() {
      if (this.state.pauseTime) {
        this.setState({
          pauseTime: undefined,
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
      const { app, hexColor, textBlocks, coverImage, loadingText, backgroundImage, pauseTime, restartSound, seekTo, isRecording, finishedEncoding } = this.state;
      const { sound, soundFileURL, wordBlocks, loadedTranscription, alignedTranscription, transcribedText, alignTranscription, aspectRatio } = this.props;
      const { config: { fps, layouts : { [aspectRatio]: { width, height, audiogram: audiogramProps, coverImage: coverImageProps, text: textProps }}} } = this.props;
      const isPlayingAudio = !(!!pauseTime);

      return (
          <div className='editorContainer min-h-full min-w-full w-full flex flex-wrap self-stretch lg:grid lg:grid-cols-editor lg:grid-rows-editor'>
              { finishedEncoding && (
                <div>Finished Encoding</div>
                )}
              { isRecording && loadingText && (
                <div className='z-20 absolute top-0 h-screen w-screen bg-gray-500 bg-opacity-75 flex justify-center items-center'>
                  <div className='p-4 relative rounded bg-white'>
                    <LoadingIndicator text={loadingText} />
                  </div>
                </div>
              )}
              <div className='flex-1 flex justify-center items-center'>
                <canvas id="myCanvas" className='mx-auto my-8 rounded shadow-lg max-h-full'></canvas>
              </div>
              <EditorTray onRecord={this.recordVideo.bind(this)} aspectRatio={aspectRatio} onColorSelect={this.onColorSelect.bind(this)} hexColor={hexColor} onCoverImageSelect={this.selectedCoverImage.bind(this)} onBackgroundImageSelect={this.selectedBackgroundImage.bind(this)} onSelectAspectRatio={this.onSelectAspectRatio.bind(this)}/>
              <Timeline soundFileURL={soundFileURL} isPlayingAudio={isPlayingAudio} onSeek={this.audioSeek.bind(this)} playAudio={this.playAudio.bind(this)} pauseAudio={this.pauseAudio.bind(this)} duration={sound && sound.duration}/>
              {/* might need to render for sound loaded */}
              <TranscriptionInput soundLoaded={true} wordBlocks={wordBlocks} onUpdateTextBlocks={this.onUpdateTextBlocks.bind(this)} requestTranscription={this.requestTranscription.bind(this)} loadedTranscription={loadedTranscription} transcribedText={transcribedText} alignTranscription={alignTranscription} alignedTranscription={alignedTranscription}/>
              <Background stage={app && app.stage} width={width} height={height} hexColor={hexColor} backgroundImage={backgroundImage}/>
              <CoverImage pixiApp={app} {...coverImageProps} icon={coverImage}/>
              <TextBlock pixiApp={app} fps={fps} seekTo={seekTo} {...textProps} textBlocks={textBlocks} pauseAt={pauseTime}/>
              <AudiogramCanvas pixiApp={app} fps={fps} aspectRatio={aspectRatio} restartSound={restartSound} seekTo={seekTo} {...audiogramProps} sound={sound} pauseAt={pauseTime}/>
              {/* <Audiogram /> */}
          </div>
      );
    }
}