import { format } from 'url';
import { Inject, Service } from 'typedi';

import { EmailAddressConfirmationTokenPayload } from '../../types/token/EmailAddressConfirmationTokenPayload';
import { EmailAddressConfirmationTokenManager } from './EmailAddressConfirmationTokenManager';
import { User } from '../../entities/user/User';
import { config } from '../../config/config';


@Service()
export class EmailAddressConfirmationService {

    @Inject()
    readonly emailAddressConfirmationTokenManager!: EmailAddressConfirmationTokenManager;


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

    generateEmailAddressConfirmationToken(userData: Pick<User, 'id'>): string {
        const tokenPayload = { sub: userData.id };
        return this.emailAddressConfirmationTokenManager.generate(tokenPayload);
    }

    /**
     * @throws will throw an error if email address confirmation token is invalid
     */
    verifyEmailAddressConfirmationToken(tokenToVerify: string): EmailAddressConfirmationTokenPayload {
        return this.emailAddressConfirmationTokenManager.verify(tokenToVerify);
    }

}
