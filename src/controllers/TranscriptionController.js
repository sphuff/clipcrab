const RevAI = require('revai-node-sdk');
const testTranscript = require('../../tests/fixtures/rev-ai-mmbam.json');


// Initialize your client with your access token
const ACCESS_TOKEN = "025UfS9u92dVmEmiVg15u-vE9w6Lufnh0XXBLNTU-IDfkpPU5o628iNfGyu92gkKVpuHq5UAHjYhUsN_pPntxF5XYI4_g";
var client = new RevAI.RevAiApiClient(ACCESS_TOKEN);

const STATUS_TRANSCRIBED = 'transcribed';

module.exports = class TranscriptionController {
    static async getWordBlocks(audioURL, isProd) {
        let transcript = testTranscript;
        if (isProd) {
            transcript = await this._getRevAiTranscript(audioURL);
        }
        return this._getWordBlocks(transcript);
    }

    static async _getRevAiTranscript(audioURL) {
        // Submit an audio file to Rev.ai
        var job = await client.submitJobUrl(audioURL, {
            skip_diarization: true,
        });

        // Check your job's status
        const jobIsReady = (job) => {
            return new Promise((resolve, reject) => {
                let timeout = setInterval(async () => {
                    console.log('timeout');
                    var jobDetails = await client.getJobDetails(job.id);
                    if (jobDetails.status === STATUS_TRANSCRIBED) {
                        resolve();
                        clearInterval(timeout);
                        timeout = null;
                    }
                }, 1000);
            });
        }

        await jobIsReady(job);
        

        // Retrieve transcript
        return await client.getTranscriptObject(job.id);
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