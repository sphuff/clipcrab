const text = 'Want this break up this big block of text? Break by clicking on me. Or, edit this block by right clicking. You can also combine individual words into larger blocks by clicking on them.';
let startTime = 0.0;

const wordBlocks = text.split(' ').map((text, idx) => {
    startTime = parseFloat((startTime + 0.6).toFixed(1));
    return {
        text: text.trim(),
        startTime: startTime,
        endTime: startTime + 0.5,
    }
})

console.log(JSON.stringify(wordBlocks));