import React, { Component } from 'react';
import ColorPicker from '../ColorPicker';
import FileSelector from '../../FileSelector';

export default class EditorTray extends Component {
    render() {
        const { hexColor, onColorSelect, onFileSelect, onRecord } = this.props;
        return (
            <>
                <div className='hidden lg:flex flex-col lg:w-full h-full bg-white shadow-xl z-10 justify-between px-4 pt-4 row-span-2'>
                    <div className='mx-auto'>
                        <ColorPicker onColorSelect={onColorSelect} hexColor={hexColor} />
                    </div>
                    <FileSelector cta={'Input your cover image'} onFileSelect={onFileSelect}/>
                    <button className='inline bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded text-base' onClick={onRecord}>Record</button>
                </div>
                <div className='flex w-full order-first justify-between lg:hidden bg-gray-400 p-2'>
                    <ColorPicker onColorSelect={onColorSelect} hexColor={hexColor} />
                    <button className='inline bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded text-xs' onClick={onRecord}>Record</button>
                </div>
            </>
        );
    }
}