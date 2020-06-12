import { PasswordResetTokenManager } from '../../../../../src/services/password-reset/PasswordResetTokenManager';


export class PasswordResetTokenManagerSpy {

    static generate: jest.SpiedFunction<typeof PasswordResetTokenManager.prototype.generate>;
    static verify: jest.SpiedFunction<typeof PasswordResetTokenManager.prototype.verify>;

    static setupSpies() {
        this.restoreSpies();
        this.generate = jest.spyOn(PasswordResetTokenManager.prototype, 'generate');
        this.verify = jest.spyOn(PasswordResetTokenManager.prototype, 'verify');
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
