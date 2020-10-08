const fs = require('fs');
const textract = require('textract');


class DescriptParser {
    static async parse(file) {
        const text = await this._getTextFromFile(file);
        const lines = text.split('\n');
        lines.shift(); // remove title
        const blocks = await this._getBlocksFromLines(lines);
        
        /**
         * [{
         *  startsAt:
         *  endsAt:
         *  speaker:
         *  text: 
         * }]
         */
        return blocks;
    }

    static _getBlocksFromLines(lines) {
        return new Promise((resolve, reject) => {
            let blocks = [];
            let idx = -1;
            let currentSpeaker;
            let startAtSecs;
            let endsAtSecs;
            let currentText;
            lines.forEach(line => {
                const timeStamp = this._getTimestampFromLine(line);
                if (timeStamp !== null) {
                    // start new block
                    if (idx !== -1) {
                        blocks[idx].endsAtSecs = timeStamp;
                    }
                    idx++;
                    blocks[idx] = {};
                    blocks[idx].startsAtSecs = timeStamp;
                    blocks[idx].speaker = this._getSpeakerFromLine(line);
                    blocks[idx].text = this._getTextFromLine(line);
                } else {
                    // append to text
                    blocks[idx].text += this._getTextFromLine(line);
                }
            });
            resolve(blocks);
        });
    }

    static _getTextFromFile(file) {
        return new Promise((resolve, reject) => {
            textract.fromFileWithPath(file, {
                preserveLineBreaks: true,
            }, function( error, text ) {
                if (error) reject(error);
                resolve(text);
            });
        });
    }

    static _getTimestampFromLine(line) {
        const timestamp = line.match(/\[.*\]/g);
        const formattedTimestamp = timestamp && timestamp[0].replace('[', '').replace(']', '');
        if (!timestamp) return null;
        const [hoursStr, minStr, secsStr] = formattedTimestamp.split(':');
        return parseInt(secsStr) + (60 * parseInt(minStr)) + (3600 * parseInt(hoursStr));
    }

    static _getSpeakerFromLine(line) {
        return line.split(':')[0];
    }

    static _getTextFromLine(line) {
        if (line.match(/\[.*\]/g)) {
            return line.split(']').pop().trim();
        } else {
            return `\n${line.trim()}`;
        }
    }
}

module.exports = DescriptParser;