import fetch from 'node-fetch';
import * as FormData from 'form-data';
import * as fs from 'fs';
import WordBlock from '../types/WordBlock';

enum GentleCase {
    Success = 'success',
    NotFoundInAudio = 'not-found-in-audio',
}
type GentleWord = {
    alignedWord: string;
    case: GentleCase;
    end: number;
    start: number;
    endOffset: number;
    startOffset: number;
    word: string;
}
type GentleResponse = {
    transcript: string;
    words: GentleWord[];
}

export default class ForcedAlignmentController {
    static async getWordBlocksFromMediaStreams(transcribedTextPath, audioPath): Promise<WordBlock[]> {
        const params = new FormData();
        params.append('audio', audioPath);
        params.append('transcript', transcribedTextPath);
        const res = await fetch('http://localhost:8765/transcriptions?async=false', {
            method: 'POST',
            body: params,
        });
        const json: GentleResponse  = await res.json();
        return this._getWordBlocks(json.words);
    }
    
    static _getWordBlocks(gentleWords: GentleWord[]): WordBlock[] {
        return gentleWords.map(word => {
            return {
                startTime: word.start,
                endTime: word.end,
                text: word.word,
            }
        })
    }
}