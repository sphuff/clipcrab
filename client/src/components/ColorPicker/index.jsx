import React, { useState } from 'react';
import { SketchPicker } from 'react-color';

export default function ColorPicker({ onColorSelect, hexColor }) {
    const [color, setColor] = useState(`#${Number(hexColor).toString(16)}`);
    const [showSketchPicker, setShowSketchPicker] = useState(false);
    const handleChangeComplete = (color) => {
        // "#b22323" to 0xb22323
        setColor(color.hex);
        onColorSelect(color.hex.replace('#', '0x'));
    };
    return (
        <div className='relative'>
            <div className='block lg:hidden w-16 h-8 rounded'
                onMouseOver={() => setShowSketchPicker(true)}
                onMouseOut={() => setShowSketchPicker(false)}
            >
                <div className='p-4 rounded w-full h-full' style={{backgroundColor: color}}></div>
            </div>
            <div className='hidden lg:block'>
                <SketchPicker onChangeComplete={ handleChangeComplete } color={color}/>
            </div>
            { showSketchPicker && (
                <div className='absolute'>
                    <SketchPicker onChangeComplete={ handleChangeComplete } color={color}/>
                </div>
            )}
        </div>
    );
}