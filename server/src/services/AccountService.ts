import { format } from 'url';
import { Inject, Service } from 'typedi';

import { EmailAddressConfirmationTokenPayload } from '../types/token/EmailAddressConfirmationTokenPayload';
import { TokenService } from './TokenService';
import { User } from '../entities/user/User';
import { config } from '../config/config';


/**
 * Class with with user account related methods.
 */
@Service()
export class AccountService {

    @Inject()
    protected readonly tokenService!: TokenService;

    /**
     * Generate email address confirmation link url.
     */
    generateEmailAddressConfirmationUrl(userData: Pick<User, 'id'>): string {
        const confirmationToken = this.generateEmailAddressConfirmationToken(userData);
        return format({
            pathname: config.token.emailAddressConfirmation.urlBase,
            query: {
                token: confirmationToken,
            },
        });
    }

    /**
     * Generate email address confirmation token and return it.
     */
    generateEmailAddressConfirmationToken(userData: Pick<User, 'id'>): string {
        const tokenPayload = { sub: userData.id };
        return this.tokenService.emailAddressConfirmationToken.generate(tokenPayload);
    }

    /**
     * @throws will throw an error if email address confirmation token is invalid
     */
    verifyEmailAddressConfirmationToken(tokenToVerify: string): EmailAddressConfirmationTokenPayload {
        return this.tokenService.emailAddressConfirmationToken.verify(tokenToVerify);
    }

}
