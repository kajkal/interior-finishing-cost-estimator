import { Service } from 'typedi';
import { AccessTokenPayload } from '../../types/token/AccessTokenPayload';
import { TokenManager } from '../TokenManager';
import { config } from '../../config/config';


@Service()
export class AccessTokenManager extends TokenManager<AccessTokenPayload> {
    protected readonly tokenConfig = config.token.access.jwt;
}
