import React from 'react';
import { TokenExpiredError } from 'jsonwebtoken';
import { TokenVerifier } from '../token/TokenVerifier';


export type VerifiedTokenFlags = 'checkExpiration';

/**
 * Verifies token and return tuple of [verifiedToken, expiredAt].
 * 'expiredAt' is present only when token is expired and token expiration is verified.
 */
export function useVerifiedToken(tokenToVerify: string | null, ...flags: VerifiedTokenFlags[]): [ string | null, Date | null ] {
    return React.useMemo(() => {
        try {
            const skipExpirationVerification = !flags.includes('checkExpiration');
            TokenVerifier.create(tokenToVerify).verifyTokenSubject().verifyTokenExpiration(skipExpirationVerification);
            return [ tokenToVerify, null ];
        } catch (error) {
            return [ null, (error instanceof TokenExpiredError) ? error.expiredAt : null ];
        }
    }, [ tokenToVerify, flags.join(',') ]);
}
