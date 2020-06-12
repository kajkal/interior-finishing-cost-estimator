import { PasswordResetService } from '../../../../../src/services/password-reset/PasswordResetService';


export class PasswordResetServiceSpy {

    static generatePasswordResetUrl: jest.SpiedFunction<typeof PasswordResetService.prototype.generatePasswordResetUrl>;
    static generatePasswordResetToken: jest.SpiedFunction<typeof PasswordResetService.prototype.generatePasswordResetToken>;
    static verifyPasswordResetToken: jest.SpiedFunction<typeof PasswordResetService.prototype.verifyPasswordResetToken>;

    static setupSpies() {
        this.restoreSpies();
        this.generatePasswordResetUrl = jest.spyOn(PasswordResetService.prototype, 'generatePasswordResetUrl');
        this.generatePasswordResetToken = jest.spyOn(PasswordResetService.prototype, 'generatePasswordResetToken');
        this.verifyPasswordResetToken = jest.spyOn(PasswordResetService.prototype, 'verifyPasswordResetToken');
    }

    private static restoreSpies() {
        this.generatePasswordResetUrl?.mockRestore();
        this.generatePasswordResetToken?.mockRestore();
        this.verifyPasswordResetToken?.mockRestore();
    }

}
