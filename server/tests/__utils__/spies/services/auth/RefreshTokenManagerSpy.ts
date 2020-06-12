import { RefreshTokenManager } from '../../../../../src/services/auth/RefreshTokenManager';


export class RefreshTokenManagerSpy {

    static generate: jest.SpiedFunction<typeof RefreshTokenManager.prototype.generate>;
    static verify: jest.SpiedFunction<typeof RefreshTokenManager.prototype.verify>;

    static setupSpies() {
        this.restoreSpies();
        this.generate = jest.spyOn(RefreshTokenManager.prototype, 'generate');
        this.verify = jest.spyOn(RefreshTokenManager.prototype, 'verify');
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
