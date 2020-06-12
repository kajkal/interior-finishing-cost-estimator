import { Service } from 'typedi';
import { RefreshTokenPayload } from '../../types/token/RefreshTokenPayload';
import { TokenManager } from '../TokenManager';
import { config } from '../../config/config';


@Service()
export class RefreshTokenManager extends TokenManager<RefreshTokenPayload> {
    protected readonly tokenConfig = config.token.refresh.jwt;
}
