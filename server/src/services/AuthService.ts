import cookie from 'cookie';
import { Service } from 'typedi';
import { Request, Response } from 'express';
import { sign, verify } from 'jsonwebtoken';

import { RefreshTokenPayload } from '../types/token/RefreshTokenPayload';
import { AccessTokenPayload } from '../types/token/AccessTokenPayload';
import { config } from '../config/config';
import { User } from '../entities/user/User';
import { logger } from '../utils/logger';


/**
 * Class with auth related methods.
 */
@Service()
export class AuthService {

    /**
     * Generate refresh token and create cookie for storing it.
     */
    generateRefreshToken(res: Response, userData: Pick<User, 'id'>): void {
        const jwtPayload = { sub: userData.id };
        const jwt = sign(jwtPayload, config.token.refresh.jwt.privateKey, config.token.refresh.jwt.options);
        res.cookie(config.token.refresh.cookie.name, jwt, config.token.refresh.cookie.options);
    }

    /**
     * Verify refresh token and return token payload.
     *
     * @throws will throw an error if refresh token cookie is invalid
     */
    verifyRefreshToken(req: Request): RefreshTokenPayload {
        const { [ config.token.refresh.cookie.name ]: tokenToVerify } = cookie.parse(req.headers.cookie!);
        logger.debug('refreshToken cookie value', tokenToVerify); // TODO: remove
        return verify(tokenToVerify, config.token.refresh.jwt.privateKey) as RefreshTokenPayload;
    }

    /**
     * Invalidate refresh token cookie.
     */
    invalidateRefreshToken(res: Response): void {
        const lethalTokenOptions = { ...config.token.refresh.jwt.options, maxAge: 0 };
        res.cookie(config.token.refresh.cookie.name, '', lethalTokenOptions);
    }

    /**
     * Generate access token and return it.
     */
    generateAccessToken(userData: Pick<User, 'id'>): string {
        const jwtPayload = { sub: userData.id };
        return sign(jwtPayload, config.token.access.jwt.privateKey, config.token.access.jwt.options);
    }

    /**
     * Verify access token and return token payload.
     *
     * @throws will throw an error if access token is invalid
     */
    verifyAccessToken(req: Request): AccessTokenPayload {
        const accessToken = req.headers[ 'authorization' ];
        const tokenToVerify = accessToken?.split('Bearer ')[ 1 ];
        return verify(tokenToVerify!, config.token.access.jwt.privateKey) as AccessTokenPayload;
    }

}
