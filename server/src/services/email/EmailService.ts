import { setApiKey } from '@sendgrid/mail';
import { Inject, Service } from 'typedi';

import { EmailAddressConfirmationService } from '../email-address-confirmation/EmailAddressConfirmationService';
import { PasswordResetInstructions } from './email-builders/PasswordResetInstructions';
import { PasswordResetService } from '../password-reset/PasswordResetService';
import { ConfirmEmailAddress } from './email-builders/ConfirmEmailAddress';
import { User } from '../../entities/user/User';
import { logger } from '../../utils/logger';
import { config } from '../../config/config';


setApiKey(config.email.apiKey);

/**
 * Class responsible for sending emails.
 */
@Service()
export class EmailService {

    @Inject()
    private readonly emailAddressConfirmationService!: EmailAddressConfirmationService;

    @Inject()
    private readonly passwordResetService!: PasswordResetService;


    /**
     * Send 'Confirm your email address' email
     */
    async sendConfirmEmailAddressEmail(userData: Pick<User, 'id' | 'name' | 'email'>) {
        try {
            await ConfirmEmailAddress.create()
                .withRecipient(userData)
                .withTemplateData({
                    name: userData.name,
                    confirmationLink: this.emailAddressConfirmationService.generateEmailAddressConfirmationUrl(userData),
                })
                .send();
            logger.info('email-send', { type: 'confirm email address', to: userData.email });
        } catch (error) {
            logger.error('email-send-error', { type: 'confirm email address', error });
        }
    }

    /**
     * Send 'Password reset instructions' email
     */
    async sendPasswordResetInstructionsEmail(userData: Pick<User, 'id' | 'name' | 'email'>) {
        try {
            await PasswordResetInstructions.create()
                .withRecipient(userData)
                .withTemplateData({
                    name: userData.name,
                    email: userData.email,
                    passwordResetLink: this.passwordResetService.generatePasswordResetUrl(userData),
                })
                .send();
            logger.info('email-send', { type: 'password reset instructions', to: userData.email });
        } catch (error) {
            logger.error('email-send-error', { type: 'password reset instructions', error });
        }
    }

}
