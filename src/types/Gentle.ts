export enum GentleCase {
    Success = 'success',
    NotFoundInAudio = 'not-found-in-audio',
}
export type GentleWord = {
    alignedWord: string;
    case: GentleCase;
    end?: number;
    start?: number;
    endOffset: number;
    startOffset: number;
    word: string;
}
export type GentleResponse = {
    transcript: string;
    words: GentleWord[];
}