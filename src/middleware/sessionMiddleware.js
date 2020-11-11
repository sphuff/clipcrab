const session = require('express-session');
const redis = require('redis');
const url = require('url');
const RedisStore = require('connect-redis')(session);

const setUpRedisStore = () => {
    let redisClient;
    const rtg = url.parse(process.env.REDIS_URL);
  
    if (process.env.NODE_ENV === 'production') {
        server.set('trust proxy', 1); // trust first proxy
        redisClient = redis.createClient(rtg.port, rtg.hostname);
        redisClient.auth(rtg.auth.split(':')[1]); // auth 1st part is username and 2nd is password separated by ":"
    } else {
        redisClient = redis.createClient();
    }
  
    const redisStore = new RedisStore({ client: redisClient });
    return redisStore;
}

module.exports = function(server) {
    const redisStore = setUpRedisStore();
    const sess = {
        secret: process.env.SESSION_SECRET,
        cookie: {},
        resave: false,
        saveUninitialized: true,
        store: redisStore,
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
