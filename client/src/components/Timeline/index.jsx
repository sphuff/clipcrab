import React, { Component, useEffect, useState } from 'react';
import Peaks from 'peaks.js';
import './index.scss';

export default function Timeline({ soundFileURL, textBlocks, duration, onSeek }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [containerWidth, setContainerWidth] = useState(null);
    const waveformRef = React.createRef();
    const mediaRef = React.createRef();
    // TODO: play muted when the audio is playing in the background
    // seek function that hooks up with parent/AudioCanvas
    useEffect(() => {
        console.log('timeline effect');
        const createVisual = async (soundFileURL) => {
            if (!soundFileURL) return null;
            let wavesurfer = window.WaveSurfer.create({
                container: '#waveform',
                waveColor: 'violet',
                progressColor: 'purple',
                plugins: [
                    window.WaveSurfer.timeline.create({
                        container: "#wave-timeline"
                    })
                ]
            });
            wavesurfer.load(soundFileURL);
            setIsLoaded(true);
            setContainerWidth(wavesurfer.container.clientWidth);
            wavesurfer.on('seek', function (seekPercentage) {
                console.log('seek in timeline');
                onSeek(duration * seekPercentage);
            });
        }
        createVisual(soundFileURL);
    }, [soundFileURL]);

    useEffect(() => {
        console.log('loaded effect');
    }, [isLoaded])

    return (
        <div className='timeline-container'>
            <div id="waveform" ref={waveformRef}></div>
            <div id="wave-timeline"></div>
            <div className='timeline-textContainer'>
                { isLoaded && textBlocks.map((block, idx) => {
                    const { text, startTime, endTime } = block;
                    return (
                        <span
                            key={`text-${idx}`}
                            className={'timeline-textBlock'}
                            style={{
                                left: (startTime / duration) * containerWidth,
                                width: (endTime - startTime) / duration * containerWidth,
                        }}>
                            <span className='firstLetter'>{text.slice(0, 1)}</span>
                            {text.slice(1)}
                        </span>
                    )
                })}
            </div>
            <audio ref={mediaRef}></audio>
        </div>
    );
}