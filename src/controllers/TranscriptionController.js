const RevAI = require('revai-node-sdk');
const testTranscript = require('../../tests/fixtures/rev-ai-mmbam.json');


// Initialize your client with your access token
const ACCESS_TOKEN = "025UfS9u92dVmEmiVg15u-vE9w6Lufnh0XXBLNTU-IDfkpPU5o628iNfGyu92gkKVpuHq5UAHjYhUsN_pPntxF5XYI4_g";
var client = new RevAI.RevAiApiClient(ACCESS_TOKEN);

const STATUS_TRANSCRIBED = 'transcribed';
const STATUS_NOT_TRANSCRIBED = 'not transcribed';

module.exports = {
    STATUS_TRANSCRIBED: STATUS_TRANSCRIBED,
    STATUS_NOT_TRANSCRIBED: STATUS_NOT_TRANSCRIBED,
    TranscriptionController: class TranscriptionController {
        static async getWordBlocks(jobId, isProd) {
            let transcript = testTranscript;
            if (isProd) {
                transcript = await client.getTranscriptObject(jobId);
            }
            return this._getWordBlocks(transcript);
        }
    
        static async getTranscriptionStatus(jobId, isProd) {
            if (!isProd) {
                return STATUS_TRANSCRIBED;
            }
            const jobDetails = await client.getJobDetails(jobId);
            if (jobDetails.status === STATUS_TRANSCRIBED) {
                return STATUS_TRANSCRIBED;
            } else {
                return STATUS_NOT_TRANSCRIBED;
            }
        }

        static async submitTranscriptionJob(audioURL, isProd) {
            if (!isProd) {
                return 1;
            }
            // Submit an audio file to Rev.ai
            const job = await client.submitJobUrl(audioURL, {
                skip_diarization: true,
            });
            return job.id;
        }
    
        /**
         * 
         * @param {*} transcriptObject 
         * should return array like
         * [{ "text": "Hi", "startTime": 1.3, "endTime": 1.5 }]
         */
        static _getWordBlocks(transcriptObject) {
            /**
             * {
             *  "monologues": [{
             *      "elements": [{
             *          "type": "text",
             *          "value": "Hello",
             *          "ts": 0.5,
             *          "end_ts": 1.5,
             *          "confidence": 1
             *      }]
             * }]
             * }
             */
            let words = transcriptObject['monologues'][0]['elements'];
            words = words.filter(word => {
                // trim away white space
                return word.type !== 'punct' || word.value !== ' ';
            });
            let wordBlocks = [];
            words.forEach((word, idx) => {
                const { value, ts, end_ts, type } = word;
                if (type === 'punct') {
                    // punctuation gets rolled up in previous block 
                    // (don't start with a punctuation plz)
                    wordBlocks[idx - 1].text = wordBlocks[idx - 1].text + value;
                } else {
                    wordBlocks[idx] = {
                        text: value,
                        startTime: ts,
                        endTime: end_ts,
                    }
                }
            });
            return wordBlocks.filter(block => !!block);
        }
    }
}