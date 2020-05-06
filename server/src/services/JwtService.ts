import cookie from 'cookie';
import { Service } from 'typedi';
import { sign, verify } from 'jsonwebtoken';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';

import { config } from '../config/config';
import { User } from '../entities/user/User';


/**
 * JSON web token payload shape
 */
export interface JwtPayload {
    userId: string;
    iat: number;
}

/**
 * Static class with JWT related methods.
 */
@Service()
export class JwtService {

    private static JWT_COOKIE_NAME = 'jwt';
    private static JWT_COOKIE_OPTIONS = {
        httpOnly: true,
        path: '/graphql',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
        // secure: process.env.NODE_ENV === 'production',
    };

    /**
     * Generate JWT and create cookie for storing it.
     */
    generate(context: ExpressContext, user: Pick<User, 'id'>): void {
        const jwtPayload = { userId: user.id };
        const jwt = sign(jwtPayload, config.auth.jwtPrivateKey);
        context.res.cookie(JwtService.JWT_COOKIE_NAME, jwt, JwtService.JWT_COOKIE_OPTIONS);
    }

    /**
     * Verify token and return token payload.
     *
     * @throws will throw an error if request is not properly authenticated.
     */
    verify(context: ExpressContext): JwtPayload {
        const { jwt: tokenToVerify } = cookie.parse(context.req.headers.cookie!);
        return verify(tokenToVerify, config.auth.jwtPrivateKey) as JwtPayload;
    }

    /**
     * Invalidate JWT cookie.
     */
    invalidate(context: ExpressContext): void {
        context.res.cookie(JwtService.JWT_COOKIE_NAME, '', { ...JwtService.JWT_COOKIE_OPTIONS, maxAge: 0 });
    }

}
