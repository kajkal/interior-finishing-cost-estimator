import dotenv from 'dotenv';
import { resolve } from 'path';
import { SignOptions } from 'jsonwebtoken';
import { CookieOptions } from 'express';

import { EmailData } from '../types/email-generation/EmailData';


if (!process.env.NODE_ENV) {
    throw new Error('The NODE_ENV environment variable is required but was not specified.');
}

dotenv.config({
    path: resolve((process.env.NODE_ENV === 'test') ? '.env.test' : '.env'),
});

/**
 * Server config object
 */
export const config = {

    server: {
        port: parseInt(process.env.PORT!),
    },

    webClient: {
        url: process.env.WEB_CLIENT_URL!,
    },

    email: {
        apiKey: process.env.SENDGRID_API_KEY!,
        accounts: {
            support: {
                name: 'Karol Leśniak Bot',
                email: 'support@karolesniak.com',
            } as EmailData,
        },
        templateIds: {
            confirmEmailAddress: 'd-6b6473326e2d41089b768e1751795dc7',
        },
    },

    logger: {
        logLevel: process.env.LOG_LEVEL!,
    },

    dataBase: {
        mongodbUrl: process.env.MONGODB_URL!,
        cacheDir: process.env.DB_CACHE_DIR!,
    },

    token: {
        access: {
            jwt: {
                privateKey: process.env.ACCESS_TOKEN_PRIVATE_KEY!,
                options: {
                    expiresIn: '15m',
                } as SignOptions,
            },
        },
        refresh: {
            jwt: {
                privateKey: process.env.REFRESH_TOKEN_PRIVATE_KEY!,
                options: {
                    expiresIn: '7d',
                } as SignOptions,
            },
            cookie: {
                name: 'rt',
                options: {
                    httpOnly: true,
                    path: '/refresh_token',
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
                    // secure: process.env.NODE_ENV === 'production',
                } as CookieOptions,
            },
        },
        emailAddressConfirmation: {
            jwt: {
                privateKey: process.env.EMAIL_ADDRESS_CONFIRMATION_TOKEN_PRIVATE_KEY!,
                options: {
                    noTimestamp: true,
                } as SignOptions,
            },
            urlBase: `${process.env.WEB_CLIENT_URL}/confirm-email-address`,
        },
    },

    gc: {
        credentialsFile: resolve(process.env.GC_CREDENTIALS_FILE!),
    },

} as const;
