import { decode, JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';


export interface TokenPayload {
    sub?: string;
    exp?: number;
}

/**
 * Token verification builder - if any step fails error will be thrown.
 */
export class TokenVerifier<Payload extends TokenPayload> {

    private constructor(private readonly payload: Payload) {
    }

    static create<Payload extends TokenPayload>(tokenToVerify?: string | null): TokenVerifier<Payload> {
        const tokenPayload = decode(tokenToVerify!);
        if (!tokenPayload || typeof tokenPayload !== 'object') {
            throw new JsonWebTokenError('INVALID_TOKEN_PAYLOAD');
        }
        return new this(tokenPayload as Payload);
    }

    verifyTokenSubject(): TokenVerifier<Payload> {
        if (!this.payload.sub) {
            throw new JsonWebTokenError('INVALID_TOKEN_SUBJECT');
        }
        return this;
    }

    verifyTokenExpiration(skipThisStep = false): TokenVerifier<Payload> {
        if (!skipThisStep) {
            const expirationTimestamp = this.payload.exp || 0;
            const currentTimestamp = (Date.now() / 1000) + 10; // + 10s as margin
            if (currentTimestamp >= expirationTimestamp) {
                throw new TokenExpiredError('TOKEN_EXPIRED', new Date(expirationTimestamp * 1000));
            }
        }
        return this;
    }

}
