import React, { useEffect, useState } from 'react';
import LoadingIndicator from '../LoadingIndicator';
import './index.scss';
import WordBlock from './WordBlock';
import WordBlockComponent from './WordBlockComponent';

type RawWordBlock = {
    text: string;
    rgba: string;
    startTime: Number;
    endTime: Number;
}

const formSentences = (wordBlocks: Array<RawWordBlock>): Array<WordBlock> => {
    let blockStart: WordBlock|undefined;
    const wordBlocksCopy = wordBlocks.map(block => new WordBlock(block.text, block.startTime, block.endTime, block.rgba));
    return wordBlocksCopy.map(block => {
        // if no block start, make block start
        // make child of first word in sentence block
        // if has period, end block
        if (!blockStart) {
            blockStart = block;
            return block;
        }
        block.parentWord = blockStart;
        blockStart.children.push(block);
        block.isActive = false;

        if (block.word.includes('.')) {
            blockStart = undefined;
        }
        return block;
    });
}

function TranscriptionInput({soundLoaded, wordBlocks: wordBlocksProp, onUpdateTextBlocks, requestTranscription, loadedTranscription }: { soundLoaded: boolean, wordBlocks: Array<RawWordBlock>, onUpdateTextBlocks: Function, requestTranscription: Function, loadedTranscription: boolean }) {
    const [wordBlocks, setWordBlocks] = useState<Array<WordBlock>>([]);
    const [isLoadingTranscription, setIsLoadingTranscription] = useState(false);

    useEffect(() => {
        const sentenceBlocks = formSentences(wordBlocksProp);
        setWordBlocks(sentenceBlocks);
    }, [wordBlocksProp]);

    useEffect(() => {
        updateTextBlocks();
    // eslint-disable-next-line
    }, [wordBlocks]);

    const updateTextBlocks = (wordBlock?: WordBlock) => {
        const activeWordBlocks = wordBlocks.filter(block => block.isActive === true);
        const textBlocks = activeWordBlocks.map(block => {
            const { startTime, id, customText } = block;
            const lastChild = block.getLastChild();
            const endTime = lastChild ? lastChild.endTime : block.endTime;
            return {
                text: customText || block.getText(), 
                startTime,
                endTime,
                firstInBlockId: id,
            }
        });
        let seekTo = wordBlock ? wordBlock.startTime : 0; 
        onUpdateTextBlocks(textBlocks, seekTo);
    }

    const loadTranscription = (evt: any) => {
        setIsLoadingTranscription(true);
        requestTranscription()
            .then(() => setIsLoadingTranscription(false));
    }

    if (!soundLoaded) return null;
    
    return (
        <div className='bg-white p-4 overflow-y-scroll'>
            <h4 className='text-md'>Click to create animation blocks. Click again to break up blocks. Right click to edit each word. Drag for more fine-grained control of blocks.</h4>
            <div className={`transcriptionInput-container`}>
                {wordBlocks.map((wordBlock, idx) => {
                    // wordBlock.prev = idx > 0 ? wordBlocks[idx - 1] : null;
                    wordBlock.prev = wordBlocks[idx - 1];
                    // wordBlock.next = idx < (wordBlocks.length - 1) ? wordBlocks[idx + 1] : null;
                    wordBlock.next = wordBlocks[idx + 1];
                    return (
                        <WordBlockComponent
                            wordBlock={wordBlock}
                            key={`wordBlock-${idx}`}
                            updateTextBlocks={updateTextBlocks}
                        />
                    );
                })}
            </div>
            { !loadedTranscription && !isLoadingTranscription && (
                <div className='flex items-center flex-col'>
                    <button className='block px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded' onClick={loadTranscription}>Transcribe Audio</button>
                </div>
            )}
            {isLoadingTranscription && (
                <div className='flex justify-center'>
                    <LoadingIndicator text='Transcribing text. This will take a minute.' subText='(For a 30 second mp3, this will usually take around 20 seconds.)' />
                </div>
            )}
        </div>
    )
}

function areEqual(prevProps: React.ComponentProps<any>, nextProps: React.ComponentProps<any>) {
    return prevProps.wordBlocks === nextProps.wordBlocks && prevProps.soundLoaded === nextProps.soundLoaded;
}

export default React.memo(TranscriptionInput, areEqual);