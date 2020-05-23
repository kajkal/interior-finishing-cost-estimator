import { setApiKey } from '@sendgrid/mail';
import { Inject, Service } from 'typedi';

import { ConfirmEmailAddress } from './emails/ConfirmEmailAddress';
import { AccountService } from './AccountService';
import { User } from '../entities/user/User';
import { logger } from '../utils/logger';
import { config } from '../config/config';


setApiKey(config.email.apiKey);

/**
 * Class responsible for sending emails.
 */
@Service()
export class EmailService {

    @Inject()
    private readonly accountService!: AccountService;


    /**
     * Send 'Confirm your email address' email
     */
    async sendConfirmEmailAddressEmail(userData: Pick<User, 'id' | 'name' | 'email'>) {
        try {
            await ConfirmEmailAddress.create()
                .withRecipient(userData)
                .withTemplateData({
                    name: userData.name,
                    confirmationLink: this.accountService.generateEmailAddressConfirmationUrl(userData),
                })
                .send();
            logger.info('email-send', { type: 'confirm email address', to: userData.email });
        } catch (error) {
            logger.error('email-send-error', { type: 'confirm email address', error });
        }
    }

}
