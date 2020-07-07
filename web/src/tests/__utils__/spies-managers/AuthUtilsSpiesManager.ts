import { AuthUtils } from '../../../code/utils/auth/AuthUtils';


export class AuthUtilsSpiesManager {

    static isProtectedOperation: jest.SpiedFunction<typeof AuthUtils.isProtectedOperation>;
    static verifyAccessToken: jest.SpiedFunction<typeof AuthUtils.verifyAccessToken>;
    static refreshAccessToken: jest.SpiedFunction<typeof AuthUtils.refreshAccessToken>;

    static setupSpies() {
        this.restoreSpies();
        this.isProtectedOperation = jest.spyOn(AuthUtils, 'isProtectedOperation');
        this.verifyAccessToken = jest.spyOn(AuthUtils, 'verifyAccessToken');
        this.refreshAccessToken = jest.spyOn(AuthUtils, 'refreshAccessToken');
    }

    static setupSpiesAndMockImplementations() {
        this.setupSpies();
        this.isProtectedOperation.mockImplementation();
        this.verifyAccessToken.mockImplementation();
        this.refreshAccessToken.mockImplementation();
    }

    private static restoreSpies() {
        this.isProtectedOperation?.mockRestore();
        this.verifyAccessToken?.mockRestore();
        this.refreshAccessToken?.mockRestore();
    }

}
