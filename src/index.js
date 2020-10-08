const express = require('express');
const server = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');

console.log('ENV: ', process.env.NODE_ENV)

const AWSService = require('./services/AWSService');
const EncodingController = require('./controllers/EncodingController');
const TranscriptionController = require('./controllers/TranscriptionController');

server.use(bodyParser.json());
server.use(cors());

server.use(express.static(path.join(__dirname, '../', 'client/build')));

server.use(
    fileUpload({
      useTempFiles: true,
      safeFileNames: true,
      preserveExtension: true,
      tempFileDir: `${__dirname}/tmp`
    })
  );

server.post('/encode', async (req, res) => {
    console.log(req.body);
    const { videoLocation, audioLocation } = req.body;
    console.log('encode', videoLocation, audioLocation);
    let localOutputLocation = path.join(__dirname, './transcoded/test.mp4');
    if (process.env.NODE_ENV === 'production') {
      localOutputLocation = await EncodingController.combineAudioAndVideo(audioLocation, videoLocation);
    }
    const filename = path.basename(localOutputLocation);
    await AWSService.uploadTranscoding(localOutputLocation, filename);
    const s3Location = await AWSService.getTranscodedFile(filename);
    res.json({ finalVideoLocation: s3Location });
});

server.post('/transcribe', async (req, res) => {
    const { audioURL } = req.body;
    const isProd = process.env.NODE_ENV === 'production';
    const wordBlocks = await TranscriptionController.getWordBlocks(audioURL, isProd);
    res.json({ wordBlocks });
});


server.post('/upload', (req, res, next) => {
    let uploadFile = req.files.file;
    const name = uploadFile.name;
    const saveAs = `${name}`;
    const fileLocation = `${__dirname}/files/${saveAs}`;

    uploadFile.mv(fileLocation, async function(err) {
      if (err) {
        return res.status(500).send(err);
      }
      let s3Location = 'https://podcast-clipper.s3.amazonaws.com/uploads/mmbam.mp3';
      if (process.env.NODE_ENV === 'production') {
          s3Location = await AWSService.uploadFile(fileLocation, saveAs);
      }
      // send back local file for later transcoding
      return res.status(200).json({ status: 'uploaded', serverFileURL: fileLocation, s3FileURL: s3Location });
    });
  });

server.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});
  

server.listen(process.env.PORT || 3001, () => console.log('server started'));
server.timeout = 60000;