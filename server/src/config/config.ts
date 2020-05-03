import dotenv from 'dotenv';
import { resolve } from 'path';


if (!process.env.NODE_ENV) {
    throw new Error('The NODE_ENV environment variable is required but was not specified.');
}

dotenv.config({
    path: resolve(process.cwd(), (process.env.NODE_ENV === 'test') ? '.env.test' : '.env'),
});

/**
 * Server config object
 */
export const config = {

    server: {
        port: parseInt(process.env.PORT || '4000'),
        corsOrigin: 'http://localhost:3000',
    },

    logger: {
        logLevel: process.env.LOG_LEVEL || 'silly',
        graphqlLogFilename: 'graphql.log',
        serverLogFilename: 'server.log',
    },

    dataBase: {
        mongodbUrl: process.env.MONGODB_URL!,
    },

    auth: {
        jwtPrivateKey: process.env.JWT_PRIVATE_KEY!,
    },

} as const;
