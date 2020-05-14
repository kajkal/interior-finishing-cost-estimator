import cookie from 'cookie';
import { Container, Service } from 'typedi';
import { Request, Response, CookieOptions } from 'express';
import { sign, SignOptions, verify } from 'jsonwebtoken';

import { config } from '../config/config';
import { User } from '../entities/user/User';
import { Logger } from '../utils/logger';


/**
 * JSON web token payload shape for access and refresh tokens
 */
export interface JwtPayload {
    userId: string; // user id
    iat: number; // issued at - as timestamp in sec
    exp: number; // expiration time - as timestamp in sec
}

/**
 * Class with auth related methods.
 */
@Service()
export class AuthService {

    private static readonly config = {
        refreshToken: {
            jwt: {
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
        accessToken: {
            jwt: {
                options: {
                    expiresIn: '15m',
                } as SignOptions,
            },
        },
    } as const;

    /**
     * Generate refresh token and create cookie for storing it.
     */
    generateRefreshToken(res: Response, userData: Pick<User, 'id'>): void {
        const jwtPayload = { userId: userData.id };
        const jwt = sign(jwtPayload, config.auth.refreshTokenPrivateKey, AuthService.config.refreshToken.jwt.options);
        res.cookie(AuthService.config.refreshToken.cookie.name, jwt, AuthService.config.refreshToken.cookie.options);
    }

    /**
     * Verify refresh token and return token payload.
     *
     * @throws will throw an error if refresh token cookie is invalid
     */
    verifyRefreshToken(req: Request): JwtPayload {
        const { [ AuthService.config.refreshToken.cookie.name ]: tokenToVerify } = cookie.parse(req.headers.cookie!);
        Container.get(Logger).debug('refreshToken cookie value', tokenToVerify); // TODO: remove
        return verify(tokenToVerify, config.auth.refreshTokenPrivateKey) as JwtPayload;
    }

    /**
     * Invalidate refresh token cookie.
     */
    invalidateRefreshToken(res: Response): void {
        const lethalTokenOptions = { ...AuthService.config.refreshToken.cookie.options, maxAge: 0 };
        res.cookie(AuthService.config.refreshToken.cookie.name, '', lethalTokenOptions);
    }

    /**
     * Generate access token and return it.
     */
    generateAccessToken(userData: Pick<User, 'id'>): string {
        const jwtPayload = { userId: userData.id };
        return sign(jwtPayload, config.auth.accessTokenPrivateKey, AuthService.config.accessToken.jwt.options);
    }

    /**
     * Verify access token and return token payload.
     *
     * @throws will throw an error if access token is invalid
     */
    verifyAccessToken(req: Request): JwtPayload {
        const accessToken = req.headers[ 'authorization' ];
        const tokenToVerify = accessToken?.split('Bearer ')[ 1 ];
        return verify(tokenToVerify!, config.auth.accessTokenPrivateKey) as JwtPayload;
    }

}
