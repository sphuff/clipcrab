import React from 'react';

export default function LoadingIndicator({ text, subText }: ({ text: string, subText?: string})) {
    
    return (
        <div className='text-base font-bold flex items-center justify-center flex-wrap max-w-24rem'>
            <span className='px-4'>{ text }</span>
            <div className='min-h-32 min-w-32 animate-spin loadingCircle-container'>
                <div className='inline-block min-h-8 min-w-8 bg-primary bg-opacity-75 rounded-full'></div>
            </div>
            {subText && <span className='text-xs'>{ subText }</span>}
        </div>
    );
}