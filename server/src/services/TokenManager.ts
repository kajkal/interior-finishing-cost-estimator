import { sign, verify } from 'jsonwebtoken';
import { TokenConfig } from '../types/token/TokenConfig';


/**
 * Base abstract class for managing JSON web tokens.
 */
export abstract class TokenManager<Payload extends object> {

    protected abstract readonly tokenConfig: TokenConfig<Payload>;

    generate(payload: Omit<Payload, 'iat' | 'exp'>): string {
        return sign(payload, this.tokenConfig.privateKey, this.tokenConfig.options);
    }

    verify(tokenToVerify: string | undefined): Payload {
        return verify(tokenToVerify!, this.tokenConfig.privateKey) as Payload;
    }

}
