import { AccessTokenManager } from '../../../../../src/services/auth/AccessTokenManager';


export class AccessTokenManagerSpy {

    static generate: jest.SpiedFunction<typeof AccessTokenManager.prototype.generate>;
    static verify: jest.SpiedFunction<typeof AccessTokenManager.prototype.verify>;

    static setupSpies() {
        this.restoreSpies();
        this.generate = jest.spyOn(AccessTokenManager.prototype, 'generate');
        this.verify = jest.spyOn(AccessTokenManager.prototype, 'verify');
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
