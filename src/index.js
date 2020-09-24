const express = require('express');
const server = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');

const AWSService = require('./services/AWSService');
const EncodingController = require('./controllers/EncodingController');
const TranscriptionController = require('./controllers/TranscriptionController');

server.use(bodyParser.json());
server.use(cors());

server.use(
    fileUpload({
      useTempFiles: true,
      safeFileNames: true,
      preserveExtension: true,
      tempFileDir: `${__dirname}/tmp`
    })
  );

server.get('/', (req, res) => res.send('hi'));
server.post('/encode', async (req, res) => {
    console.log(req.body);
    const { videoFilename, audioFilename } = req.body;
    console.log('encode', videoFilename, audioFilename);

    // const ret = await EncodingController.createMP4(audioFilename, videoFilename);
    res.send('encode');
});

server.post('/transcribe', async (req, res) => {
    const { audioURL } = req.body;
    const wordBlocks = await TranscriptionController.getWordBlocks(audioURL);
    res.json({ wordBlocks });
});


server.post('/upload', (req, res, next) => {
    let uploadFile = req.files.file;
    const name = uploadFile.name;
    const saveAs = `${name}`;

    uploadFile.mv(`${__dirname}/files/${saveAs}`, async function(err) {
      if (err) {
        return res.status(500).send(err);
      }
      const fileURL = await AWSService.uploadFile(`${__dirname}/files/${saveAs}`, saveAs);
      return res.status(200).json({ status: 'uploaded', location: fileURL });
    });
  });
  

server.listen(3001, () => console.log('server started'));