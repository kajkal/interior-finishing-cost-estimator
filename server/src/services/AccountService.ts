import { format } from 'url';
import { Service } from 'typedi';
import { sign, verify } from 'jsonwebtoken';

import { EmailAddressConfirmationTokenPayload } from '../types/token/EmailAddressConfirmationTokenPayload';
import { User } from '../entities/user/User';
import { config } from '../config/config';


/**
 * Class with with user account related methods.
 */
@Service()
export class AccountService {

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
        const jwtPayload = { sub: userData.id };
        return sign(jwtPayload, config.token.emailAddressConfirmation.jwt.privateKey, config.token.emailAddressConfirmation.jwt.options);
    }

    /**
     * @throws will throw an error if email address confirmation token is invalid
     */
    verifyEmailAddressConfirmationToken(tokenToVerify: string): EmailAddressConfirmationTokenPayload {
        return verify(tokenToVerify, config.token.emailAddressConfirmation.jwt.privateKey) as EmailAddressConfirmationTokenPayload;
    }

}
