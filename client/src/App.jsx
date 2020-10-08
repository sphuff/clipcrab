import React, {Component} from 'react';
import logo from './assets/logo.png';
import './App.scss';
import pixiSound from 'pixi-sound';
import config from './config.json';
import { hexToRGB, getRandomColorHex } from './utils';
import { NORMAL_ALPHA, } from './constants';
import Axios from 'axios';
import FileSelector from './FileSelector';

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
      hasSelectedSound: false, 
      loadedTranscription: false,
      isReadyForVideoEditor: false,
      finalVideoLocation: null,
      restartSound: 0,
      seekTo: 0,
    };
  }

  async encodeVideo(serverAudioFileURL, serverVideoFileURL) {
    const res = await fetch('http://localhost:3001/encode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoLocation: serverVideoFileURL,
        audioLocation: serverAudioFileURL,
      }),
    });
    console.log(res);
    const json = await res.json();
    this.setState({
      finalVideoLocation: json.finalVideoLocation,
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
    let res = await Axios.post('http://localhost:3001/upload', formData);
    console.log(res);
    const { serverFileURL, s3FileURL } = res.data;
    return { serverFileURL, s3FileURL };
  }

  async requestTranscription(fileURL) {
    let res = await Axios.post('http://localhost:3001/transcribe', { audioURL: fileURL });
    console.log(res);
    const { wordBlocks } = res.data;
    this.setState({
      loadedTranscription: true,
      isLoading: false,
      wordBlocks: this.initWordBlocks(wordBlocks),
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
    const { serverFileURL, s3FileURL } = await this.uploadFile(file);
    this.setState({
      serverAudioFileURL: serverFileURL,
      loadingText: 'Transcribing text',
    });
    await this.loadSound(file);
    await this.requestTranscription(s3FileURL);
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
    const { serverAudioFileURL, isLoading, loadingText, loadedTranscription, hasSelectedSound, finalVideoLocation, sound, soundFile, wordBlocks } = this.state;
    const isReadyForVideoEditor = loadedTranscription && sound;

    if (finalVideoLocation) {
      return (
        <div className="appContainer">
          Congrats, you can download your video by clicking <a href={finalVideoLocation} download>here</a>
        </div>
      );
    }
    return (
      <div className="appContainer overflow-x-hidden lg:max-h-screen min-h-screen min-w-screen bg-gray-200">
        <header className='bg-gray-400 min-w-screen flex'>
          <img src={logo} className='h-42 w-100'/>
        </header>
        <div className='appContainer-contentContainer max-w-screen flex-1 flex justify-center items-center'>
          { !hasSelectedSound && (
            <FileSelector onFileSelect={this.selectedSound.bind(this)} cta={'Input your mp3 file'}/>
          )}

          { isLoading && (
            <LoadingIndicator text={loadingText} />
          )}
          
          { isReadyForVideoEditor && (
            <Editor sound={sound} soundFile={soundFile} wordBlocks={wordBlocks} config={config} uploadFile={this.uploadFile.bind(this)} encodeVideo={this.encodeVideo.bind(this)} serverAudioFileURL={serverAudioFileURL}/>
          )}
        </div>
      </div>
    );
  }
}
