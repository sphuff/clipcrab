import * as express from 'express';
import DBService from '../services/DBService';
import SmsService from '../services/SmsService';

const router = express.Router();

router.get('/success', async (req, res) => {
    const { encodingId } = req.query;
    if (!encodingId) {
        // await SmsService.sendTextToSelf('Something broke with billing');
        res.send('Sorry, there is something going on. I\'ll work on a fix. Please contact me a clipcrab@gmail.com');
    }
    console.log('Successful payment');
    // await SmsService.sendTextToSelf('Someone paid you money for ClipCrab!!!');
    const encoding = await DBService.getUserEncodeById(encodingId);
    const encodingLocation = encoding.finalEncodingLocation;
    res.redirect(encodingLocation);
});

export default router;