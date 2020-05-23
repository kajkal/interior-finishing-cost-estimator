import { MailDataRequired, send } from '@sendgrid/mail';

import { User } from '../../entities/user/User';
import { config } from '../../config/config';


/**
 * Shape of template data used in 'Confirm your email address' email
 */
export interface ConfirmEmailAddressTemplateData {

    /**
     * User name
     */
    name: string;

    /**
     * Email address confirmation link url
     */
    confirmationLink: string;

}

/**
 * 'Confirm your email address' email builder class.
 */
export class ConfirmEmailAddress {

    protected constructor(private readonly mailData: Partial<MailDataRequired>) {
    }

    static create() {
        return new this({
            from: config.email.accounts.support,
            templateId: config.email.templateIds.confirmEmailAddress,
        });
    }

    withRecipient(userData: Pick<User, 'name' | 'email'>): this {
        this.mailData.to = {
            name: userData.name,
            email: userData.email,
        };
        return this;
    }

    withTemplateData(templateData: ConfirmEmailAddressTemplateData): this {
        this.mailData.dynamicTemplateData = templateData;
        return this;
    }

    async send() {
        return send(this.mailData as MailDataRequired);
    }

}
