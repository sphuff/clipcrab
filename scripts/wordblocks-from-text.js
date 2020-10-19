const text = 'Want this to be one big block of text? Combine by clicking on me. Or, [edit this block] by right clicking.';
let startTime = 0.0;
const wordBlocks = text.split(/\[|\]/g).filter(text => text !== '').map((text, idx) => {
    startTime = parseFloat((startTime + 0.6).toFixed(1));
    return {
        text: text.trim(),
        startTime: startTime,
        endTime: startTime + 0.5,
    }
});

console.log(wordBlocks);