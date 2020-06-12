import { EmailAddressConfirmationService } from '../../../../../src/services/email-address-confirmation/EmailAddressConfirmationService';


export class EmailAddressConfirmationServiceSpy {

    static generateEmailAddressConfirmationUrl: jest.SpiedFunction<typeof EmailAddressConfirmationService.prototype.generateEmailAddressConfirmationUrl>;
    static generateEmailAddressConfirmationToken: jest.SpiedFunction<typeof EmailAddressConfirmationService.prototype.generateEmailAddressConfirmationToken>;
    static verifyEmailAddressConfirmationToken: jest.SpiedFunction<typeof EmailAddressConfirmationService.prototype.verifyEmailAddressConfirmationToken>;

    static setupSpies() {
        this.restoreSpies();
        this.generateEmailAddressConfirmationUrl = jest.spyOn(EmailAddressConfirmationService.prototype, 'generateEmailAddressConfirmationUrl');
        this.generateEmailAddressConfirmationToken = jest.spyOn(EmailAddressConfirmationService.prototype, 'generateEmailAddressConfirmationToken');
        this.verifyEmailAddressConfirmationToken = jest.spyOn(EmailAddressConfirmationService.prototype, 'verifyEmailAddressConfirmationToken');
    }

    private static restoreSpies() {
        this.generateEmailAddressConfirmationUrl?.mockRestore();
        this.generateEmailAddressConfirmationToken?.mockRestore();
        this.verifyEmailAddressConfirmationToken?.mockRestore();
    }

}
