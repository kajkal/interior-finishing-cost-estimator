import { Service } from 'typedi';
import { PasswordResetTokenPayload } from '../../types/token/PasswordResetTokenPayload';
import { config } from '../../config/config';
import { TokenManager } from '../TokenManager';


@Service()
export class PasswordResetTokenManager extends TokenManager<PasswordResetTokenPayload> {
    protected readonly tokenConfig = config.token.passwordReset.jwt;
}
