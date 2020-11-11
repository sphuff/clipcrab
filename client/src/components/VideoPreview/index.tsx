import React from 'react';
import PaymentOptions from '../PaymentOptions';
import { Config, DisplayType } from '../../types/config';

type Props = {
    encodingId: number;
    videoURL: string;
    config: Config;
    aspectRatio: DisplayType;
}

const VideoPreview: React.FC<Props> = (props) => {
    const { encodingId, videoURL, config, aspectRatio } = props;
    const { width, height } = config.layouts[aspectRatio];
    return (
        <div className='flex flex-col'>
            <video className='mx-auto my-8 rounded shadow-lg' src={videoURL} width={width} height={height}></video>
            <PaymentOptions successURL={`http://localhost:3001/billing/success?encodingId=${encodingId}`}/>
        </div>
    )
}

export default VideoPreview;