import { AccountService } from '../../../src/services/AccountService';


export class AccountServiceSpiesManager {

    static generateEmailAddressConfirmationUrl: jest.SpiedFunction<typeof AccountService.prototype.generateEmailAddressConfirmationUrl>;
    static generateEmailAddressConfirmationToken: jest.SpiedFunction<typeof AccountService.prototype.generateEmailAddressConfirmationToken>;
    static verifyEmailAddressConfirmationToken: jest.SpiedFunction<typeof AccountService.prototype.verifyEmailAddressConfirmationToken>;

    static setupSpies() {
        this.restoreSpies();
        this.generateEmailAddressConfirmationUrl = jest.spyOn(AccountService.prototype, 'generateEmailAddressConfirmationUrl');
        this.generateEmailAddressConfirmationToken = jest.spyOn(AccountService.prototype, 'generateEmailAddressConfirmationToken');
        this.verifyEmailAddressConfirmationToken = jest.spyOn(AccountService.prototype, 'verifyEmailAddressConfirmationToken');
    }

    private static restoreSpies() {
        this.generateEmailAddressConfirmationUrl?.mockRestore();
        this.generateEmailAddressConfirmationToken?.mockRestore();
        this.verifyEmailAddressConfirmationToken?.mockRestore();
    }

}
