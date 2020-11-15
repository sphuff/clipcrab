const dotenv = require('dotenv');
dotenv.config();
import * as express from 'express';
const server = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
import * as morgan from 'morgan';
import billingRoutes from './routes/billing';

const sessionMiddleware = require('./middleware/sessionMiddleware');
const authMiddleware = require('./middleware/authMiddleware');
const userInViews = require('./middleware/userInViews');
import corsMiddleware from './middleware/corsMiddleware';

const fileUpload = require('express-fileupload');
import {createConnection} from 'typeorm';
import DBService from './services/DBService';
import * as fs from 'fs';

const NUM_ALLOWED_ENCODINGS = 3;

console.log('ENV: ', process.env.NODE_ENV)

const { AWSService, STATUS_TRANSCODED } = require('./services/AWSService');
import EncodingController from './controllers/EncodingController';
import ForcedAlignmentController from './controllers/ForcedAlignmentController';
import SmsService from './services/SmsService';
import TranscriptionController, { STATUS_TRANSCRIBED } from './controllers/TranscriptionController';

const asyncHandler = require('express-async-handler')
const secured = require('./middleware/secured');
const dbUrl = process.env.NODE_ENV === 'production' ? `${process.env.DATABASE_URL}?ssl=true` : process.env.DATABASE_URL;

createConnection({
  url: dbUrl,
  type: 'postgres',
  entities: [path.join(__dirname, './entity/**/*.ts')],
}).then(async () => {
  server.use(bodyParser.json());
  server.use(cookieParser());
  server.use(morgan('dev'));
  
  
  corsMiddleware(server);
  sessionMiddleware(server);
  authMiddleware(server);
  server.use(userInViews());
  server.use(authRoutes);
  server.use('/', userRoutes);
  server.use('/billing', billingRoutes);
  
  server.use(
      fileUpload({
        useTempFiles: true,
        safeFileNames: true,
        preserveExtension: true,
        tempFileDir: `/tmp`
      })
    );

  server.use(async (req, res, next) => {
    // helper func for local dev
    // @ts-ignore
    if (process.env.NODE_ENV === 'development' && !req.session.userEntity) {
      console.log('set debug user');
      // @ts-ignore
      req.session.userEntity = await DBService.getUserById(1);
    }
    next();
  });
  
  server.post('/encode', asyncHandler(async (req, res) => {
      const { videoLocation, audioLocation } = req.body;
      console.log('encode', videoLocation, audioLocation);
      console.log('encoding for user', req.session.userEntity);
      if (!videoLocation || !audioLocation) {
        return res.status(400).json({ error: 'Must pass video and audio paths to encode' });
      }
      const filename = path.basename(videoLocation);
      // check count here
      // @ts-ignore
      let user = null;
      if (req.session.userEntity) {
        user = await DBService.getUserById(req.session.userEntity.id);
      }
      const newEncoding = await DBService.createUserEncode(user, filename);
      await SmsService.sendTextToSelf('New video created on ClipCrab');
      if (user) {
        const encodings = await DBService.getEncodingsForUser(user);
        const clipLimit = (user && user.numAllowedClipsTotal) || NUM_ALLOWED_ENCODINGS;
        if (process.env.NODE_ENV === 'production' && encodings.length > clipLimit) {
          await SmsService.sendTextToSelf('User hit video limit');
          res.status(403).json({ error: 'You have hit your allotment of free encodings. Please contact support at clipcrab@gmail.com.' });
          return;
        }
      }
      if (process.env.NODE_ENV === 'production') {
          EncodingController.combineAudioAndVideo(audioLocation, videoLocation)
            .then((localOutputLocation) => AWSService.uploadTranscoding(localOutputLocation, filename))
            .catch(err => {
              console.log('encoding error:', err.message);
              res.status(500).json({ error: err.message })
            });
      }
      // response is sent before transcoding is created/uploaded
      res.json({ fileName: filename, encodingId: newEncoding.id });
  }));
  
  server.get('/encoding', async (req, res) => {
    const { fileName, encodingId } = req.query;

    const transcriptionStatus = await AWSService.getTranscodingStatus(fileName);
    if (transcriptionStatus !== STATUS_TRANSCODED) {
      console.log('transcode not ready');
      return res.status(429).send();
    }
    const s3Location = AWSService.getTranscodedFile(fileName);
    const encoding = await DBService.getUserEncodeById(parseInt(encodingId as string));
    const update = await DBService.updateUserEncodeLocation(encoding.id, s3Location);
    console.log('update: ', update);
    console.log('final encoding: ', s3Location);
    res.json({ finalVideoLocation: s3Location });
  });
  
  
  server.post('/transcribe', async (req, res: express.Response) => {
      const { audioURL } = req.body;
      // const isProd = true;
      const isProd = process.env.NODE_ENV === 'production';
      try {
        const jobId = await TranscriptionController.submitTranscriptionJob(audioURL, isProd)
        res.json({ jobId });
      } catch(err) {
        console.log('Transcription job err', err);
        res.status(500).send();
      }
  });
  
  server.get('/transcription', async (req, res) => {
    const { jobId } = req.query;
    // const isProd = true;
    const isProd = process.env.NODE_ENV === 'production';
    const transcriptionStatus = await TranscriptionController.getTranscriptionStatus(jobId, isProd);
    if (transcriptionStatus !== STATUS_TRANSCRIBED) {
      console.log('not ready');
      return res.status(429).send();
    }
    const { wordBlocks, text } = await TranscriptionController.getWordBlocks(jobId, isProd);
    res.json({ wordBlocks, text });
  });

  server.post('/align', async (req, res) => {
    const { transcribedText } = req.body;
    // @ts-ignore
    let audioFile = req.files.file;
    const audioFilePath = audioFile.tempFilePath;
    try {
      const audioStream = fs.createReadStream(audioFilePath);

      const wordBlocks = await ForcedAlignmentController.getWordBlocksFromMediaStreams(transcribedText, audioStream);
      res.json({
        wordBlocks,
        text: transcribedText,
      });
    } catch(err) {
      console.log('Alignment error: ', err);
    }
  })
  
  
  server.post('/upload', (req, res, next) => {
    // @ts-ignore
      let uploadFile = req.files.file;
      const name = uploadFile.name;
      const saveAs = `${name}`;
      const fileLocation = `/tmp/${saveAs}`;
      console.log('upload: ', name);
  
      uploadFile.mv(fileLocation, async function(err) {
        if (err) {
          return res.status(500).send(err);
        }
        let s3Location = 'https://podcast-clipper.s3.amazonaws.com/mmbam.mp3';
        if (process.env.NODE_ENV === 'production') {
            s3Location = await AWSService.uploadFile(fileLocation, saveAs);
        }
        // send back local file for later transcoding
        return res.status(200).json({ status: 'uploaded', serverFileURL: fileLocation, s3FileURL: s3Location });
      });
    });
  
  server.get('/auth0-logo', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'client/assets/auth0-logo.png'));
  });
  
  // weird but secure index.html and let rest through
  server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'client/build/index.html'));
  });
  server.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'client/build/index.html'));
  });
  
  server.use(express.static(path.join(__dirname, '../', 'client/build')));
  
  server.get('*', (req,res) =>{
      res.sendFile(path.join(__dirname, '../', 'client/build/index.html'));
  });
    
  
  server.listen(process.env.PORT || 3001, async () => {
    console.log('server started');
  });
  // @ts-ignore
  server.timeout = 60000;
});
