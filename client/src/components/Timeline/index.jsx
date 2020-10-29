import React, { useEffect, useState } from 'react';

export default function Timeline({ soundFileURL, playAudio, isPlayingAudio, pauseAudio, duration, onSeek }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [wavesurfer, setWavesurfer] = useState(null);
    const waveformRef = React.createRef();

    const initTimeline = () => {
        const wavesurferInst = window.WaveSurfer.create({
            container: '#waveform',
            waveColor: '#a0aec0', // gray-500
            height: 50,
            progressColor: '#4a5568', // gray-700
            plugins: [
                window.WaveSurfer.timeline.create({
                    container: "#wave-timeline"
                })
            ]
        });
        setWavesurfer(wavesurferInst);
        wavesurferInst.load(soundFileURL);
        setIsLoaded(true);
        wavesurferInst.on('ready', function () {
            wavesurferInst.setMute(true);
            wavesurferInst.play();
        });
        wavesurferInst.on('seek', function (seekPercentage) {
            console.log('seek in timeline', seekPercentage);
            onSeek(duration * seekPercentage);
            wavesurferInst.play(duration * seekPercentage);
        });
    }
    
    useEffect(() => {
        console.log('timeline effect');
        const createVisual = async (soundFileURL) => {
            if (!soundFileURL) return null;
            window.WaveSurfer && initTimeline();
        }
        createVisual(soundFileURL);
        // eslint-disable-next-line
    }, [soundFileURL]);

    useEffect(() => {
        console.log('loaded effect');
    }, [isLoaded]);

    const togglePlay = () => {
        const newIsPlaying = !isPlayingAudio;
        if (newIsPlaying) {
            wavesurfer.play();
            playAudio();
        } else {
            wavesurfer.pause();
            pauseAudio();
        }
    }

    return (
        <div className='timelineContainer w-full flex items-center justify-around p-2'>
            <div className='h-full w-5/6'>
                <div id="waveform" ref={waveformRef}></div>
                <div id="wave-timeline" className=''></div>
            </div>
            <div className='bg-white rounded px-4 py-2'>
                <i className={`fas ${isPlayingAudio ? 'fa-pause' : 'fa-play'} cursor-pointer my-auto text-gray-600 hover:text-gray-800`} onClick={() => togglePlay()}></i>
            </div>
        </div>
    );
}