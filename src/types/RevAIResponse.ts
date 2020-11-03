export interface RevAIElement {
    type: string;
    value: string;
    ts: number;
    end_ts: number;
    confidence: number;
}

interface RevAIMonologue {
    speaker: number;
    elements: RevAIElement[]
}

export default interface RevAIResponse {
    monologues: RevAIMonologue[];
}