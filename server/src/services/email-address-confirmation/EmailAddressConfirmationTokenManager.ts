import { Service } from 'typedi';
import { EmailAddressConfirmationTokenPayload } from '../../types/token/EmailAddressConfirmationTokenPayload';
import { config } from '../../config/config';
import { TokenManager } from '../TokenManager';


@Service()
export class EmailAddressConfirmationTokenManager extends TokenManager<EmailAddressConfirmationTokenPayload> {
    protected readonly tokenConfig = config.token.emailAddressConfirmation.jwt;
}
