import { format } from 'url';
import { Inject, Service } from 'typedi';

import { PasswordResetTokenPayload } from '../../types/token/PasswordResetTokenPayload';
import { PasswordResetTokenManager } from './PasswordResetTokenManager';
import { User } from '../../entities/user/User';
import { config } from '../../config/config';


@Service()
export class PasswordResetService {

    @Inject()
    protected readonly passwordResetTokenManager!: PasswordResetTokenManager;


    /**
     * Generate password reset link url.
     */
    generatePasswordResetUrl(userData: Pick<User, 'id'>): string {
        const passwordResetToken = this.generatePasswordResetToken(userData);
        return format({
            pathname: config.token.passwordReset.urlBase,
            query: {
                token: passwordResetToken,
            },
        });
    }

    generatePasswordResetToken(userData: Pick<User, 'id'>): string {
        const tokenPayload = { sub: userData.id };
        return this.passwordResetTokenManager.generate(tokenPayload);
    }

    /**
     * @throws will throw an error if password reset token is invalid
     */
    verifyPasswordResetToken(tokenToVerify: string): PasswordResetTokenPayload {
        return this.passwordResetTokenManager.verify(tokenToVerify);
    }

}
