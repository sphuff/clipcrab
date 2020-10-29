import React, { Component } from 'react';
import ColorPicker from '../ColorPicker';
import FileSelector from '../../FileSelector';
import AspectRatioSelector from '../AspectRatioSelector';

export default class EditorTray extends Component {
    render() {
        const { hexColor, onColorSelect, onCoverImageSelect, onBackgroundImageSelect, onSelectAspectRatio, onRecord, aspectRatio } = this.props;
        return (
            <>
                <div className='editor-tray-lg hidden lg:flex flex-col lg:w-full h-full bg-white shadow-xl z-10 justify-between px-4 pt-4 row-span-3'>
                    <div className='mx-auto'>
                        <ColorPicker onColorSelect={onColorSelect} hexColor={hexColor} />
                    </div>
                    <AspectRatioSelector onSelectAspectRatio={onSelectAspectRatio} aspectRatio={aspectRatio} />
                    <FileSelector cta={'Input a logo image'} onFileSelect={onCoverImageSelect}/>
                    <FileSelector cta={'Input a background image'} onFileSelect={onBackgroundImageSelect}/>
                    <button className='record-button inline bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded text-base' onClick={onRecord}>Record</button>
                </div>
                <div className='editor-tray-sm flex items-center w-full order-first justify-between lg:hidden bg-gray-300 p-2 overflow-x-scroll'>
                    <div className='mx-2'>
                        <ColorPicker onColorSelect={onColorSelect} hexColor={hexColor} />
                    </div>
                    <AspectRatioSelector onSelectAspectRatio={onSelectAspectRatio} aspectRatio={aspectRatio} />
                    <div>
                        <FileSelector cta={'Input a logo image'} onFileSelect={onCoverImageSelect} customText='Upload Logo Image' showCTA={false}/>
                        <FileSelector cta={'Input a background image'} onFileSelect={onBackgroundImageSelect} customText='Upload Background Image' showCTA={false}/>
                    </div>
                    <button className='mx-2 record-button inline bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded text-xs' onClick={onRecord}>Record</button>
                </div>
            </>
        );
    }
}