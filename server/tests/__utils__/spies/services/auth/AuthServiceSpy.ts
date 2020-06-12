import { AuthService } from '../../../../../src/services/auth/AuthService';


export class AuthServiceSpy {

    static generateRefreshToken: jest.SpiedFunction<typeof AuthService.prototype.generateRefreshToken>;
    static verifyRefreshToken: jest.SpiedFunction<typeof AuthService.prototype.verifyRefreshToken>;
    static invalidateRefreshToken: jest.SpiedFunction<typeof AuthService.prototype.invalidateRefreshToken>;

    static generateAccessToken: jest.SpiedFunction<typeof AuthService.prototype.generateAccessToken>;
    static verifyAccessToken: jest.SpiedFunction<typeof AuthService.prototype.verifyAccessToken>;

    static setupSpies() {
        this.restoreSpies();
        this.generateRefreshToken = jest.spyOn(AuthService.prototype, 'generateRefreshToken');
        this.verifyRefreshToken = jest.spyOn(AuthService.prototype, 'verifyRefreshToken');
        this.invalidateRefreshToken = jest.spyOn(AuthService.prototype, 'invalidateRefreshToken');
        this.generateAccessToken = jest.spyOn(AuthService.prototype, 'generateAccessToken');
        this.verifyAccessToken = jest.spyOn(AuthService.prototype, 'verifyAccessToken');
    }

    static setupSpiesAndMockImplementations() {
        this.setupSpies();
        this.generateRefreshToken.mockImplementation();
        this.verifyRefreshToken.mockImplementation();
        this.invalidateRefreshToken.mockImplementation();
        this.generateAccessToken.mockImplementation();
        this.verifyAccessToken.mockImplementation();
    }

    private static restoreSpies() {
        this.generateRefreshToken?.mockRestore();
        this.verifyRefreshToken?.mockRestore();
        this.invalidateRefreshToken?.mockRestore();
        this.generateAccessToken?.mockRestore();
        this.verifyAccessToken?.mockRestore();
    }

}
