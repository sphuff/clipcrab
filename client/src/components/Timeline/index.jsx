import React, { Component, useEffect, useState } from 'react';

export default function Timeline({ soundFileURL, playAudio, pauseAudio, duration, onSeek }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const waveformRef = React.createRef();

    const initTimeline = () => {
        let wavesurfer = window.WaveSurfer.create({
            container: '#waveform',
            waveColor: 'violet',
            height: 50,
            progressColor: 'purple',
            plugins: [
                window.WaveSurfer.timeline.create({
                    container: "#wave-timeline"
                })
            ]
        });
        wavesurfer.load(soundFileURL);
        setIsLoaded(true);
        wavesurfer.on('seek', function (seekPercentage) {
            console.log('seek in timeline');
            onSeek(duration * seekPercentage);
        });
    }
    // TODO: play muted when the audio is playing in the background
    // seek function that hooks up with parent/AudioCanvas
    useEffect(() => {
        console.log('timeline effect');
        const createVisual = async (soundFileURL) => {
            if (!soundFileURL) return null;
            window.WaveSurfer && initTimeline();
        }
        createVisual(soundFileURL);
    }, [soundFileURL]);

    useEffect(() => {
        console.log('loaded effect');
    }, [isLoaded]);
    
    useEffect(() => {
        console.log('playing', isPlaying);
    }, [isPlaying]);

    const togglePlay = () => {
        const newIsPlaying = !isPlaying;
        setIsPlaying(newIsPlaying);
        newIsPlaying && playAudio();
        !newIsPlaying && pauseAudio();
    }

    return (
        <div className='h-full w-full flex items-center justify-around p-2'>
            <div className='h-full w-5/6'>
                <div id="waveform" ref={waveformRef}></div>
                <div id="wave-timeline" className=''></div>
            </div>
            <div className='bg-white rounded px-4 py-2'>
                <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} cursor-pointer my-auto text-gray-600 hover:text-gray-800`} onClick={() => togglePlay()}></i>
            </div>
        </div>
    );
}