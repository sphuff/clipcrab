import * as cors from 'cors';

const corsMiddleware = (server) => {
    const whitelist = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'https://app.clipcrab.com'];
    const corsOptions: cors.CorsOptions = {
        origin: function (origin, callback) {
            if (whitelist.indexOf(origin) !== -1 || !origin) {
              callback(null, true)
            } else {
              console.log(origin);
              callback(new Error('Not allowed by CORS'))
            }
        },
        credentials: true,
    };
    return server.use(cors(corsOptions));
}

export default corsMiddleware;