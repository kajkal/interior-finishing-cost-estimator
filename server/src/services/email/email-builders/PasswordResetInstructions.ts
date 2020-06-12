import { config } from '../../../config/config';
import { EmailBuilder } from './EmailBuilder';


/**
 * Shape of template data used in 'Password reset instructions' email.
 */
export interface PasswordResetInstructionsTemplateData {

    /**
     * User name
     */
    name: string;

    /**
     * Password reset link url
     */
    passwordResetLink: string;

}

export class PasswordResetInstructions extends EmailBuilder<PasswordResetInstructionsTemplateData> {

    static create() {
        return new this(config.email.templateIds.passwordResetInstructions);
    }

}
