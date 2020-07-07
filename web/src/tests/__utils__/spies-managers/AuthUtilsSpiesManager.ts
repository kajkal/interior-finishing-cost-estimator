import { AuthUtils } from '../../../code/utils/auth/AuthUtils';


export class AuthUtilsSpiesManager {

    static prepareRequest: jest.SpiedFunction<typeof AuthUtils.prepareRequest>;
    static refreshAccessToken: jest.SpiedFunction<typeof AuthUtils.refreshAccessToken>;

    static setupSpies() {
        this.restoreSpies();
        this.prepareRequest = jest.spyOn(AuthUtils, 'prepareRequest');
        this.refreshAccessToken = jest.spyOn(AuthUtils, 'refreshAccessToken');
    }

    static setupSpiesAndMockImplementations() {
        this.setupSpies();
        this.prepareRequest.mockImplementation();
        this.refreshAccessToken.mockImplementation();
    }

    private static restoreSpies() {
        this.prepareRequest?.mockRestore();
        this.refreshAccessToken?.mockRestore();
    }

}
