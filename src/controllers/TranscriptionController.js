const RevAI = require('revai-node-sdk');


// Initialize your client with your access token
const ACCESS_TOKEN = "025UfS9u92dVmEmiVg15u-vE9w6Lufnh0XXBLNTU-IDfkpPU5o628iNfGyu92gkKVpuHq5UAHjYhUsN_pPntxF5XYI4_g";
var client = new RevAI.RevAiApiClient(ACCESS_TOKEN);

const STATUS_TRANSCRIBED = 'transcribed';

module.exports = class TranscriptionController {
    static async getText(audioURL) {
        // Submit an audio file to Rev.ai
        var job = await client.submitJobUrl(audioURL);

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
        var transcript = await client.getTranscriptObject(job.id);
        return transcript;
    }
}