import React from 'react';

export default function AspectRatioSelector({ onSelectAspectRatio, aspectRatio }: { onSelectAspectRatio: Function, aspectRatio: string }) {
    const onSelect = (e: any) => {
        onSelectAspectRatio(e.target.value);
    }
    return (
        <div>
            <label htmlFor="aspect-ratio-select" className='text-sm'>Aspect Ratio:</label>
            <select id='aspect-ratio-select' className='border mx-2 px-2 py-1 rounded shadow-lg' onChange={onSelect} defaultValue={aspectRatio}>
                <option value='phone'>16:9</option>
                <option value='square'>1:1</option>
            </select>
        </div>
    );
}