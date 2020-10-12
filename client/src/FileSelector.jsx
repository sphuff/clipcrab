import React, { useRef } from 'react';

export default function FileSelector({ cta, onFileSelect }) {
    const fileRef = useRef(null);

    const fileSelected = (e) => {
        const file = fileRef.current.files[0];
        console.log(fileRef);
        console.log(onFileSelect);
        onFileSelect(e, file);
        // clear files in case they want to reselect
        fileRef.current.value = '';
    }

    const id = `upload-file-${cta.replace(/ /g, '-')}`;

    return (
        <form>
            <h4 className='font-semibold text-base py-4'>{cta}</h4>
            <label htmlFor={id} className='cursor-pointer rounded text-sm bg-gray-400 px-4 py-2'><i className='fas fa-upload'></i> Upload File</label>
            <input id={id} type="file" className='invisible' ref={fileRef} onChange={(e) => fileSelected(e)}/>
        </form>
    );
}