import { TokenVerifier } from '../../../code/utils/token/TokenVerifier';


export class TokenVerifierSpy {

    static validInstance = TokenVerifier.create('eyJhbGciOiJIUzI1NiJ9.e30._');

    static create: jest.SpiedFunction<typeof TokenVerifier.create>;
    static verifyTokenSubject: jest.SpiedFunction<typeof TokenVerifier.prototype.verifyTokenSubject>;
    static verifyTokenExpiration: jest.SpiedFunction<typeof TokenVerifier.prototype.verifyTokenExpiration>;

    static setupSpies() {
        this.restoreSpies();
        this.create = jest.spyOn(TokenVerifier, 'create');
        this.verifyTokenSubject = jest.spyOn(TokenVerifier.prototype, 'verifyTokenSubject');
        this.verifyTokenExpiration = jest.spyOn(TokenVerifier.prototype, 'verifyTokenExpiration');
    }

    static setupSpiesAndMockImplementations() {
        this.setupSpies();
        this.create.mockReturnValue(this.validInstance);
        this.verifyTokenSubject.mockReturnThis();
        this.verifyTokenExpiration.mockReturnThis();
    }

    private static restoreSpies() {
        this.create?.mockRestore();
        this.verifyTokenSubject?.mockRestore();
        this.verifyTokenExpiration?.mockRestore();
    }

}
