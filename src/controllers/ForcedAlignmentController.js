module.exports = class ForcedAlignmentController {
    static getWordBlocksFromMedia(transcribedText, audioURL) {
        return [{
            text: transcribedText,
            startTime: 0,
            endTime: 10,
        }];
    }
}