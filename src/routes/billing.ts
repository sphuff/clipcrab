import * as express from 'express';
import DBService from '../services/DBService';
import SmsService from '../services/SmsService';

const router = express.Router();

router.get('/success', async (req, res) => {
    const { encodingId } = req.query;
    if (!encodingId) {
        await SmsService.sendTextToSelf('Something broke with billing');
        res.send('Sorry, there is something going on. I\'ll work on a fix. Please contact me a clipcrab@gmail.com');
    }
    const encoding = await DBService.getUserEncodeById(Number(encodingId));
    console.log('Successful payment');
    await SmsService.sendTextToSelf('Someone paid you money for ClipCrab!!!');
    const encodingLocation = encoding.finalEncodingLocation;
    res.redirect(encodingLocation);
});

router.get('/success/user', async (req, res) => {
    const { encodingId } = req.query;
    if (!encodingId) {
        await SmsService.sendTextToSelf('Something broke with billing');
        res.send('Sorry, there is something going on. I\'ll work on a fix. Please contact me a clipcrab@gmail.com');
    }
    const encoding = await DBService.getUserEncodeById(Number(encodingId));
    // @ts-ignore
    if (!req.session.userEntity) {
        // redirect to auth middleware
        // @ts-ignore
        req.session.returnTo = req.originalUrl;
        const redirectURL = process.env.BASE_URL ? `${process.env.BASE_URL}/login` : 'http://localhost:3001/login';
        return res.redirect(redirectURL);
    } else {
        // is a user - count to their 3 free clips
        // @ts-ignore
        const user = await DBService.getUserById(req.session.userEntity.id);
        const update = await DBService.updateUserEncodeUser(encoding.id, user);
        console.log('Update user encode with user: ', update);
        await SmsService.sendTextToSelf('A new user just claimed one of their free clips');
    }
    const encodingLocation = encoding.finalEncodingLocation;
    res.redirect(encodingLocation);
});

export default router;