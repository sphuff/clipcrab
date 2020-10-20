const session = require('express-session');

module.exports = function(server) {
    const sess = {
        secret: process.env.SESSION_SECRET,
        cookie: {},
        resave: false,
        saveUninitialized: true
    };
      
    if (server.get('env') === 'production') {
        // Use secure cookies in production (requires SSL/TLS)
        sess.cookie.secure = true;
    
        // Uncomment the line below if your application is behind a proxy (like on Heroku)
        // or if you're encountering the error message:
        // "Unable to verify authorization request state"
        server.set('trust proxy', 1);
    }
      
      
    server.use(session(sess));
}
