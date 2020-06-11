import { Service } from 'typedi';
import { sign, verify } from 'jsonwebtoken';

import { TokenConfig } from '../types/token/TokenConfig';
import { config } from '../config/config';


export interface TokenManager<Payload extends object> {
    generate: (payload: Omit<Payload, 'iat' | 'exp'>) => string;
    verify: (tokenToVerify: string | undefined) => Payload;
}

function createTokenManager<Payload extends object>(tokenConfig: TokenConfig<Payload>): TokenManager<Payload> {
    return {
        generate: (payload: Omit<Payload, 'iat' | 'exp'>): string => {
            return sign(payload, tokenConfig.privateKey, tokenConfig.options);
        },
        verify: (tokenToVerify: string | undefined): Payload => {
            return verify(tokenToVerify!, tokenConfig.privateKey) as Payload;
        },
    };
}

@Service()
export class TokenService {
    accessToken = createTokenManager(config.token.access.jwt);
    refreshToken = createTokenManager(config.token.refresh.jwt);
    emailAddressConfirmationToken = createTokenManager(config.token.emailAddressConfirmation.jwt);
    passwordResetToken = createTokenManager(config.token.passwordReset.jwt);
}
