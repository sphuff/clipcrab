import React, { useRef } from 'react';

export default function FileSelector({ cta, onFileSelect, inputId, customText, showCTA = true }) {
    const fileRef = useRef(null);

    const fileSelected = (e) => {
        const file = fileRef.current.files[0];
        console.log(fileRef);
        console.log(onFileSelect);
        onFileSelect(e, file);
        // clear files in case they want to reselect
        fileRef.current.value = '';
    }

    const id = inputId || `upload-file-${cta.replace(/ /g, '-')}`;
    const text = customText || 'Upload File';
    return (
        <form>
            { showCTA && <h4 className='font-semibold text-base py-4'>{cta}</h4>}
            <label htmlFor={id} className='cursor-pointer rounded text-sm bg-gray-400 px-4 py-2 float-left'>
                <i className='fas fa-upload'></i>
                {text}
            </label>
            <input id={id} type="file" className='invisible w-2 h-2' ref={fileRef} onChange={(e) => fileSelected(e)}/>
        </form>
    );
}