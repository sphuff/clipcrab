import fetch from 'node-fetch';
import * as FormData from 'form-data';
import * as fs from 'fs';
import { Readable } from 'stream';
import WordBlock from '../types/WordBlock';
import { GentleCase, GentleResponse, GentleWord } from '../types/Gentle';

export default class ForcedAlignmentController {
    static async getWordBlocksFromMediaStreams(transcribedText: string, audioPath: fs.ReadStream): Promise<WordBlock[]> {
        const params = new FormData();
        params.append('audio', audioPath);
        const transcribedTextStream = new Readable();
        transcribedTextStream.push(transcribedText);
        transcribedTextStream.push(null);
        params.append('transcript', transcribedTextStream);
        // can spin up gentle locally and hit that instead
        const res = await fetch('http://161.35.109.218:8765/transcriptions?async=false', {
            method: 'POST',
            body: params,
        });
        const json: GentleResponse  = await res.json();
        return this._getWordBlocks(json.words, transcribedText);
    }
    
    static _getWordBlocks(gentleWords: GentleWord[], originalText: string): WordBlock[] {
        return this._extrapolateClipTimes(gentleWords).map(word => {
            const text = originalText.slice(word.startOffset, word.endOffset + 1).trim();
            return {
                startTime: word.start,
                endTime: word.end,
                text,
            }
        });
    }
    
    /**
     * Extrapolates the start and end times of a clip based on its neighbors. 
     * The gist is - if either is undefined, find the next neighbor with a defined
     * value. Then, use the average word length on top of the distance to that word
     * to determine the approximate spoken time for the current word.
     * 
     * @param wordBlocks 
     */
    private static _extrapolateClipTimes(wordBlocks: GentleWord[]): GentleWord[] {
        const definedBlocks = wordBlocks
            .filter(block => block.start !== undefined && block.end !== undefined)
            .map(block => block.end - block.start);

        const averageWordTime = (definedBlocks.reduce((prev, curr) => {
            return prev + curr;
        }, 0)) / definedBlocks.length;

        return wordBlocks.filter(word => word.case === GentleCase.Success).map((block, idx) => {
            if (block.start === undefined) {
                const startingBlock = wordBlocks.slice(idx).find(wordBlock => wordBlock.start !== undefined);
                const startBlockIdx = wordBlocks.slice(idx).findIndex(wordBlock => wordBlock.start !== undefined);
                const distance = startBlockIdx - idx;
                block.start = startingBlock.start - (averageWordTime * distance);
            }
            if (block.end === undefined) {
                const endingBlock = wordBlocks.slice(idx).find(wordBlock => wordBlock.end !== undefined);
                const endBlockIdx = wordBlocks.slice(idx).findIndex(wordBlock => wordBlock.end !== undefined);
                const distance = endBlockIdx - idx;
                block.end = endingBlock.end - (averageWordTime * distance);
            }
            return block;
        });
    }
}