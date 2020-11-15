import * as express from 'express';
import * as passport from 'passport';
import DBService from '../services/DBService';
import * as querystring from 'querystring';
import * as url from 'url';
import SmsService from '../services/SmsService';

const router = express.Router();

router.get('/login', passport.authenticate('auth0', {
    scope: 'openid email profile'
}), function (req, res) {
    // @ts-ignore
    res.redirect(req.session.returnTo || '/');
});

router.get('/callback', function (req, res, next) {
    passport.authenticate('auth0', function (err, user, info) {
      if (err) { 
        console.log('passport auth err: ', err);
        return next(err);
      }
      if (!user) { 
        console.log('passport no user');
        return res.redirect('/login');
      }
      // @ts-ignore
      req.logIn(user, async function (err) {
        if (err) { return next(err); }
        console.log('log in success', user.id);
        let userEntity = await DBService.getUserByAuth0Id(user.id);
        if (!userEntity) {
          console.log('creating new user: ', user.id);
          userEntity = await DBService.createNewUser(user.id);
          console.log('created new user: ', userEntity);
          await SmsService.sendTextToSelf('New user signup on ClipCrab');
        }
        // @ts-ignore
        req.session.userEntity = userEntity;
        // @ts-ignore
        req.session.save(err => {
          // @ts-ignore
          req.userEntity = userEntity;
          // @ts-ignore
          const returnTo = req.session.returnTo;
          // @ts-ignore
          console.log('saved user cookie');
          // @ts-ignore
          delete req.session.returnTo;
          res.redirect(returnTo || '/');
        });
      });
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    // @ts-ignore
    req.logout();
  
    var returnTo = req.protocol + '://' + req.hostname;
    var port = req.connection.localPort;
    if (port !== undefined && port !== 80 && port !== 443) {
      returnTo += ':' + port;
    }
    var logoutURL = new url.URL(
      `https://${process.env.AUTH0_DOMAIN}/v2/logout`
    );
    var searchString = querystring.stringify({
      client_id: process.env.AUTH0_CLIENT_ID,
      returnTo: returnTo
    });
    logoutURL.search = searchString;
  
    res.redirect(logoutURL.toString());
});

module.exports = router;