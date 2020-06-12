import { EmailService } from '../../../../../src/services/email/EmailService';


export class EmailServiceSpy {

    static sendConfirmEmailAddressEmail: jest.SpiedFunction<typeof EmailService.prototype.sendConfirmEmailAddressEmail>;
    static sendPasswordResetInstructionsEmail: jest.SpiedFunction<typeof EmailService.prototype.sendPasswordResetInstructionsEmail>;

    static setupSpies() {
        this.restoreSpies();
        this.sendConfirmEmailAddressEmail = jest.spyOn(EmailService.prototype, 'sendConfirmEmailAddressEmail');
        this.sendPasswordResetInstructionsEmail = jest.spyOn(EmailService.prototype, 'sendPasswordResetInstructionsEmail');
    }

    static setupSpiesAndMockImplementations() {
        this.setupSpies();
        this.sendConfirmEmailAddressEmail.mockImplementation();
        this.sendPasswordResetInstructionsEmail.mockImplementation();
    }

    private static restoreSpies() {
        this.sendConfirmEmailAddressEmail?.mockRestore();
        this.sendPasswordResetInstructionsEmail?.mockRestore();
    }

}
