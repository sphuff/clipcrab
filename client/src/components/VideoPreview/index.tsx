import React from 'react';
import PaymentOptions from '../PaymentOptions';
import { Config, DisplayType } from '../../types/config';
import { makeServerURL } from '../../utils';

type Props = {
    encodingId: number;
    videoURL: string;
    config: Config;
    aspectRatio: DisplayType;
}

const VideoPreview: React.FC<Props> = (props) => {
    const { encodingId, videoURL, config, aspectRatio } = props;
    const { width, height } = config.layouts[aspectRatio];

    const cancelURL = process.env.REACT_APP_BASE_URL || 'http://localhost:3001/cancel';
    return (
        <div className='flex flex-col'>
            <video className='mx-auto my-8 rounded shadow-lg' controls src={videoURL} width={width} height={height}></video>
            <PaymentOptions cancelURL={cancelURL} signupSuccessURL={makeServerURL(`/billing/success/user?encodingId=${encodingId}`)} paymentSuccessURL={makeServerURL(`/billing/success?encodingId=${encodingId}`)}/>
        </div>
    )
}

export default VideoPreview;