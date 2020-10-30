import React, {Component} from 'react';
import logo from './assets/logo.png';
import './App.scss';
import pixiSound from 'pixi-sound';
import config from './config.json';
import { hexToRGB, getRandomColorHex, makeServerURL } from './utils';
import { NORMAL_ALPHA, } from './constants';
import Axios from 'axios';
import FileSelector from './FileSelector';
import { toast } from 'react-toastify';
import axiosRetry from 'axios-retry';
import walkthroughTranscription from './walkthrough-transcription.json';

import Editor from './components/Editor';
import LoadingIndicator from './components/LoadingIndicator';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      app: null,
      canvas: null,
      config,
      wordBlocks: [],
      soundFile: null,
      coverImage: null,
      serverAudioFileURL: null,
      isLoading: false, 
      loadingText: null,
      loadingSubText: null,
      hasSelectedSound: false, 
      loadedTranscription: false,
      isReadyForVideoEditor: false,
      finalVideoLocation: null,
      restartSound: 0,
      seekTo: 0,
    };
  }

  async encodeVideo(serverAudioFileURL, serverVideoFileURL) {
    const res = await fetch(makeServerURL('/encode'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoLocation: serverVideoFileURL,
        audioLocation: serverAudioFileURL,
      }),
    });
    const json = await res.json();
    const { error, fileName } = json;
    if (error) {
      console.log('there was an error', error);
      toast.error(error);
      throw error;
    }

    const axiosInstance = Axios.create();
    axiosRetry(axiosInstance, { retries: 50, retryCondition: (e) => !e.response || e.response.status === 429 || axiosRetry.isNetworkOrIdempotentRequestError(e), retryDelay: (retryCount) => 2000 });
    let encodingRes = await axiosInstance.get(makeServerURL('/encoding'), { params: { fileName }});

    console.log(encodingRes);
    this.setState({
      finalVideoLocation: encodingRes.data.finalVideoLocation,
    });
  }

  exportVideo(blob) {
    console.log('exporting', blob);
    const source = document.createElement('source')
    const video = document.getElementById('videoPlayer');
    source.src = URL.createObjectURL(blob);
    video.appendChild(source);
    video.controls = true;
  }

  async uploadFile(file) {
    let formData = new FormData();
    formData.append('file', file);
    let res = await Axios.post(makeServerURL('/upload'), formData);
    console.log(res);
    const { s3FileURL } = res.data;
    return { s3FileURL };
  }

  async requestTranscription(fileURL) {
    const res = await Axios.post(makeServerURL('/transcribe'), { audioURL: fileURL });
    const { jobId } = res.data;
    const axiosInstance = Axios.create();
    axiosRetry(axiosInstance, { retries: 50, retryCondition: (e) => !e.response || e.response.status === 429 || axiosRetry.isNetworkOrIdempotentRequestError(e), retryDelay: (retryCount) => 2000 });
    const transcriptionRes = await axiosInstance.get(makeServerURL('/transcription'), { params: { jobId } });
    const { wordBlocks } = transcriptionRes.data;

    this.setState({
      loadedTranscription: true,
      isLoading: false,
      wordBlocks: this.initWordBlocks(wordBlocks),
      loadingText: null,
    });
  }

  async selectedSound(e, file) {
    console.log('selected sound', e, file);
    console.log(e.currentTarget);
    if (file.type !== 'audio/mpeg') {
      alert('Must enter mp3 file');
      return;
    }
    if (file.size > 1000000) {
      alert('Must upload audio file smaller than 1 MB');
      return;
    }
    this.setState({
      isLoading: true,
      hasSelectedSound: true,
      loadingText: 'Uploading audio',
    });
    const { s3FileURL } = await this.uploadFile(file);
    this.setState({
      serverAudioFileURL: s3FileURL,
    });
    await this.loadSound(file);
    this.loadTestTranscription();
  }

  loadTestTranscription() {
    this.setState({
      wordBlocks: this.initWordBlocks(walkthroughTranscription),
    });
  }
  
  async loadSound(file) {
    const arrayBuffer = await file.arrayBuffer();
    const soundFileURL = URL.createObjectURL(file);
    pixiSound.Sound.from({
      source: arrayBuffer,
      preload: true,
      singleInstance: true,
      loaded: (err, sound) => {
        this.setState({
          sound,
          soundFile: file,
          soundFileURL: soundFileURL,
          isLoading: false,
        });
      }
    });
  }

  initWordBlocks(wordBlocks) {
    return wordBlocks.map(block => {
      const colorHex = getRandomColorHex();
      const rgba = hexToRGB(colorHex, NORMAL_ALPHA);
      block.rgba = rgba;
      return block;
    });
  }

  render() {
    const { serverAudioFileURL, isLoading, loadingText, loadingSubText, loadedTranscription, hasSelectedSound, finalVideoLocation, sound, soundFile, soundFileURL, wordBlocks } = this.state;
    const isReadyForVideoEditor = !!sound;

    if (finalVideoLocation) {
      return (
        <div className="appContainer">
          Congrats, you can download your video by clicking <a href={finalVideoLocation} className='encoding-link text-blue-400' download>here</a>
        </div>
      );
    }
    return (
      <div className="appContainer overflow-x-hidden lg:max-h-screen min-h-screen min-w-screen bg-gray-200">
        <header className='bg-gray-400 min-w-screen flex'>
          <img src={logo} className='h-42 w-100' alt="clipcrab-logo"/>
        </header>
        <div className='appContainer-contentContainer max-w-screen flex-1 flex justify-center items-center'>
          { !hasSelectedSound && (
            <div className='px-4'>
              <FileSelector onFileSelect={this.selectedSound.bind(this)} cta={'Input your mp3 file (1MB limit)'} inputId='audio-input'/>
            </div>
          )}

          { isLoading && (
            <LoadingIndicator text={loadingText} subText={loadingSubText}/>
          )}
          
          { isReadyForVideoEditor && (
            <Editor
              sound={sound}
              soundFile={soundFile}
              soundFileURL={soundFileURL}
              wordBlocks={wordBlocks}
              config={config}
              finishedEncoding={finalVideoLocation}
              uploadFile={this.uploadFile.bind(this)}
              encodeVideo={this.encodeVideo.bind(this)}
              serverAudioFileURL={serverAudioFileURL}
              loadedTranscription={loadedTranscription}
              requestTranscription={this.requestTranscription.bind(this)}
            />
          )}
        </div>
      </div>
    );
  }
}
