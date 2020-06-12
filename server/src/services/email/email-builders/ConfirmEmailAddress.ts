import { config } from '../../../config/config';
import { EmailBuilder } from './EmailBuilder';


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
export class ConfirmEmailAddress extends EmailBuilder<ConfirmEmailAddressTemplateData> {

    static create() {
        return new this(config.email.templateIds.confirmEmailAddress);
    }

}
