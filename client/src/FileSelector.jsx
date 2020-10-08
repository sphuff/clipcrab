import React, { Component } from 'react';

export default class FileSelector extends Component {
    constructor(props) {
        super(props);
        this.fileInput = React.createRef();
    }
    
    fileSelected(e) {
        const { onFileSelect } = this.props;
        const file = this.fileInput.current.files[0];
        onFileSelect(e, file);
    }

    render() {
        const { cta } = this.props;
        return (
            <form>
                <h4 className='font-semibold text-base py-4'>{cta}</h4>
                <label for="upload-file" className='cursor-pointer rounded text-sm bg-gray-400 px-4 py-2'><i className='fas fa-upload'></i> Upload File</label>
                <input id='upload-file' type="file" className='invisible' ref={this.fileInput} onChange={this.fileSelected.bind(this)}/>
            </form>
        );
    }
}