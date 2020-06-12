import cookie from 'cookie';
import { Inject, Service } from 'typedi';
import { Request, Response } from 'express';

import { RefreshTokenPayload } from '../../types/token/RefreshTokenPayload';
import { AccessTokenPayload } from '../../types/token/AccessTokenPayload';
import { RefreshTokenManager } from './RefreshTokenManager';
import { AccessTokenManager } from './AccessTokenManager';
import { User } from '../../entities/user/User';
import { config } from '../../config/config';


/**
 * Class with auth related methods.
 */
@Service()
export class AuthService {

    @Inject()
    protected readonly accessTokenManager!: AccessTokenManager;

    @Inject()
    protected readonly refreshTokenManager!: RefreshTokenManager;


    /**
     * Generate refresh token and create cookie for storing it.
     */
    generateRefreshToken(res: Response, userData: Pick<User, 'id'>): void {
        const tokenPayload = { sub: userData.id };
        const refreshToken = this.refreshTokenManager.generate(tokenPayload);
        res.cookie(config.token.refresh.cookie.name, refreshToken, config.token.refresh.cookie.options);
    }

    /**
     * Verify refresh token and return token payload.
     *
     * @throws will throw an error if refresh token cookie is invalid
     */
    verifyRefreshToken(req: Request): RefreshTokenPayload {
        const { [ config.token.refresh.cookie.name ]: tokenToVerify } = cookie.parse(req.headers.cookie!);
        return this.refreshTokenManager.verify(tokenToVerify);
    }

    /**
     * Invalidate refresh token cookie.
     */
    invalidateRefreshToken(res: Response): void {
        const lethalCookieOptions = { ...config.token.refresh.cookie.options, maxAge: 0 };
        res.cookie(config.token.refresh.cookie.name, '', lethalCookieOptions);
    }

    /**
     * Generate access token and return it.
     */
    generateAccessToken(userData: Pick<User, 'id'>): string {
        const tokenPayload = { sub: userData.id };
        return this.accessTokenManager.generate(tokenPayload);
    }

    /**
     * Verify access token and return token payload.
     *
     * @throws will throw an error if access token is invalid
     */
    verifyAccessToken(req: Request): AccessTokenPayload {
        const accessToken = req.headers[ 'authorization' ];
        const tokenToVerify = accessToken?.split('Bearer ')[ 1 ];
        return this.accessTokenManager.verify(tokenToVerify);
    }

}
