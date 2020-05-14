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
        port: parseInt(process.env.PORT!),
        corsOrigin: process.env.CORS_ORIGIN!,
    },

    logger: {
        logLevel: process.env.LOG_LEVEL!,
        graphqlLogFilename: 'graphql.log',
        serverLogFilename: 'server.log',
    },

    dataBase: {
        mongodbUrl: process.env.MONGODB_URL!,
    },

    auth: {
        accessTokenPrivateKey: process.env.ACCESS_TOKEN_PRIVATE_KEY!,
        refreshTokenPrivateKey: process.env.REFRESH_TOKEN_PRIVATE_KEY!,
    },

} as const;
