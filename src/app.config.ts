import * as dotenv from 'dotenv';
import * as path from 'path';

const parse = dotenv.config({
    path: path.join(__dirname, '..', '.env'),
});

if (!parse.error) {
    process.env = { ...process.env, ...parse.parsed };
}

const configuration = {
    dev: {
        http: {
            port: parseInt(process.env.HTTP_PORT) || 3000,
        },

        nats: {
            uri: process.env.NATS_URI || "nats://localhost:4222",
        },

        app: {
            name: "@services/user-api",
            tag: "user-api",
            secret: process.env.APP_SECRET || '5e4e4d747b9a41f2be29',
            namespace: process.env.APP_NAMESPACE || "17cbb8cd-0ed8-49cc-a11d-db659648c623"
        },
        
        database: {
            url: process.env.DB_URI || 'mongodb://<user>:<pass>@<host>/<name>?authSource=admin',
            host: process.env.DB_HOST || '127.0.0.1:27019',
            user: process.env.DB_USER || 'master',
            pass: process.env.DB_PASS || 'admin@123',
            name: process.env.DB_NAME || 'database',
        },

        jwt: {
            secret: process.env.JWT_SECRET || '231d2888b772744310bed',
            expiry: parseInt(process.env.JWT_EXPIRATION_DELAY) || 24 * 60 * 60,
        },
    },
};

export default () => (configuration[process.env.NODE_ENV]);
