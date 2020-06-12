import { EmailAddressConfirmationTokenManager } from '../../../../../src/services/email-address-confirmation/EmailAddressConfirmationTokenManager';


export class EmailAddressConfirmationTokenManagerSpy {

    static generate: jest.SpiedFunction<typeof EmailAddressConfirmationTokenManager.prototype.generate>;
    static verify: jest.SpiedFunction<typeof EmailAddressConfirmationTokenManager.prototype.verify>;

    static setupSpies() {
        this.restoreSpies();
        this.generate = jest.spyOn(EmailAddressConfirmationTokenManager.prototype, 'generate');
        this.verify = jest.spyOn(EmailAddressConfirmationTokenManager.prototype, 'verify');
    }

    static setupSpiesAndMockImplementations() {
        this.setupSpies();
        this.generate.mockImplementation();
        this.verify.mockImplementation();
    }

    private static restoreSpies() {
        this.generate?.mockRestore();
        this.verify?.mockRestore();
    }

}
