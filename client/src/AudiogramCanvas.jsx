import React, { useEffect, Component } from 'react';
import mp3 from './mmbam.mp3';
import * as PIXI from 'pixi.js';
import pixiSound from 'pixi-sound';
import { getXPos } from './utils';

const NUM_SPECTROGRAM_SEGMENTS = 18;
const SAMPLES_PER_SEC = 48000;

// not me 
function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

const getSpectrogramData = (buffer, data, startingIdx, elapsedMs, height) => {
    let segments = new Array(NUM_SPECTROGRAM_SEGMENTS);
    segments.fill(0, 0, segments.length);
    const dataPointsInTimeFrame = Math.floor(SAMPLES_PER_SEC * (elapsedMs / 1000));
    const dataPointsPerSegment = Math.floor(dataPointsInTimeFrame / NUM_SPECTROGRAM_SEGMENTS);
    const endingIdx = (startingIdx + dataPointsInTimeFrame) < buffer.length ? startingIdx + dataPointsInTimeFrame : buffer.length;
    for(let i = startingIdx; i < endingIdx; i++) {
        const segmentIdx = Math.floor((i - startingIdx) / dataPointsPerSegment);
        const dataPoint = Math.abs(data[i]);
        segments[segmentIdx] += dataPoint;
    }
    const segmentAvgs = segments.map(segment => isNaN(segment) ? 0 : segment / dataPointsPerSegment);
    // makes all segments relative to the loudest one
    // const normalizeData = filteredData => {
    //     const multiplier = Math.pow(Math.max(...filteredData), -1);
    //     return filteredData.map(n => n * multiplier);
    // }
    // const normalized = normalizeData(segmentAvgs);
    const mapToHeight = normalizedData => {
        return normalizedData.map(normData => normData * height);
    }
    const heightMap = mapToHeight(segmentAvgs);
    return {
        endingIdx: endingIdx,
        spectrogramData: heightMap
    };
}

export default class AudiogramCanvas extends Component {
    startAnimation() {
        const { pixiApp, sound, alignX, x, y: startingY, width, height, fps } = this.props;
        const { stage } = pixiApp;
    
        const startingX = getXPos(x, alignX, pixiApp, width);

        this.currentTime = 0;
        this.ticker = PIXI.Ticker.shared;
        this.ticker.autoStart = false;
        let graphics = new PIXI.Graphics();
        stage.addChild(graphics);
        graphics.zIndex = 1;
        this.startingIdx = 0;
        const audioMultiplier = 1.5;
        this.ticker.maxFPS = fps;

        const xBuffer = 10;
        const totalXBuffer = NUM_SPECTROGRAM_SEGMENTS * xBuffer;
        let rectWidth = Math.floor((width - totalXBuffer) / NUM_SPECTROGRAM_SEGMENTS);
        const spectroGramXPadding = (width - (totalXBuffer + (NUM_SPECTROGRAM_SEGMENTS * rectWidth))) / 2;
        this.ticker.add(() => {
            const media = sound.media;
            const buffer = media.buffer;
            this.currentTime += this.ticker.elapsedMS;
            if (media.buffer) {
                // have 48000 data points per second
                const data = media.buffer.getChannelData(0);
                // get time frame from here to 16.6 ms in future
                // TODO: get just once later
                const { spectrogramData, endingIdx } = getSpectrogramData(buffer, data, this.startingIdx, this.ticker.elapsedMS, height);
                graphics.clear();
                spectrogramData.map((spectrogramBlock, idx) => {
                    let x = startingX + Math.floor(idx * rectWidth)  + (xBuffer * idx) + spectroGramXPadding;
                    
                    // limit it to height
                    const h = Math.min(spectrogramBlock * audioMultiplier, height);
                    
                    let y = startingY + Math.floor((height - h) / 2);

                    graphics.beginFill(0xFFFFFF);
                    graphics.drawRect(x, y, rectWidth, h);
                    graphics.endFill();
                });
                this.startingIdx = endingIdx;
            }
        });
        this.ticker.start();
    }

    componentDidMount() {
        console.log('start sound');
        this.props.sound.play();
    }

    componentDidUpdate(props) {
        if (this.props.pixiApp && !props.pixiApp) {
            console.log('start animation');
            this.startAnimation();
        }
        if (props.pauseAt !== this.props.pauseAt) {
            const isPaused = this.props.pauseAt !== null;
            isPaused && this.ticker.stop();
            !isPaused && this.ticker.start();
        }
        if (props.restartSound !== this.props.restartSound) {
            // restart spectrogram
            this.currentTime = 0;
            this.startingIdx = 0;
            this.props.sound.play({
                start: 0,
            });
        } else if (props.seekTo !== this.props.seekTo) {
            this.currentTime = this.props.seekTo;
            this.startingIdx = Math.floor(SAMPLES_PER_SEC * this.currentTime);
            this.props.sound.play({
                start: this.props.seekTo,
            });
        }
    }

    render() {
        return null;
    }    
}