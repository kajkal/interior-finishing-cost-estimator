import { EmailService } from '../../../src/services/EmailService';


export class EmailServiceSpiesManager {

    static sendConfirmEmailAddressEmail: jest.SpiedFunction<typeof EmailService.prototype.sendConfirmEmailAddressEmail>;

    static setupSpies() {
        this.restoreSpies();
        this.sendConfirmEmailAddressEmail = jest.spyOn(EmailService.prototype, 'sendConfirmEmailAddressEmail');
    }

    static setupSpiesAndMockImplementations() {
        this.setupSpies();
        this.sendConfirmEmailAddressEmail.mockImplementation();
    }

    private static restoreSpies() {
        this.sendConfirmEmailAddressEmail?.mockRestore();
    }

}
