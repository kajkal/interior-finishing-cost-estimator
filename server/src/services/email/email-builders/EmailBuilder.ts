import { MailDataRequired, send } from '@sendgrid/mail';

import { User } from '../../../entities/user/User';
import { config } from '../../../config/config';


/**
 * Abstract email builder.
 */
export class EmailBuilder<TemplateData> {

    protected readonly mailData: Partial<MailDataRequired>;

    protected constructor(templateId: string) {
        this.mailData = {
            from: config.email.accounts.support,
            templateId,
        };
    }

    withRecipient(userData: Pick<User, 'name' | 'email'>): this {
        this.mailData.to = {
            name: userData.name,
            email: userData.email,
        };
        return this;
    }

    withTemplateData(templateData: TemplateData): this {
        this.mailData.dynamicTemplateData = templateData;
        return this;
    }

    async send() {
        return send(this.mailData as MailDataRequired);
    }

}
