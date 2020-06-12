import dotenv from 'dotenv';
import { resolve } from 'path';
import { CookieOptions } from 'express';

import { EmailAddressConfirmationTokenPayload } from '../types/token/EmailAddressConfirmationTokenPayload';
import { PasswordResetTokenPayload } from '../types/token/PasswordResetTokenPayload';
import { RefreshTokenPayload } from '../types/token/RefreshTokenPayload';
import { AccessTokenPayload } from '../types/token/AccessTokenPayload';
import { EmailData } from '../types/email-generation/EmailData';
import { TokenConfig } from '../types/token/TokenConfig';


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
            passwordResetInstructions: 'd-159845d4e18747acbd0e32a1de0a779a',
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
                },
            } as TokenConfig<AccessTokenPayload>,
        },
        refresh: {
            jwt: {
                privateKey: process.env.REFRESH_TOKEN_PRIVATE_KEY!,
                options: {
                    expiresIn: '7d',
                },
            } as TokenConfig<RefreshTokenPayload>,
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
                },
            } as TokenConfig<EmailAddressConfirmationTokenPayload>,
            urlBase: `${process.env.WEB_CLIENT_URL}/confirm-email-address`,
        },
        passwordReset: {
            jwt: {
                privateKey: process.env.PASSWORD_RESET_TOKEN_PRIVATE_KEY!,
                options: {
                    expiresIn: '2h',
                },
            } as TokenConfig<PasswordResetTokenPayload>,
            urlBase: `${process.env.WEB_CLIENT_URL}/reset-password`,
        },
    },

    gc: {
        credentialsFile: resolve(process.env.GC_CREDENTIALS_FILE!),
    },

} as const;
