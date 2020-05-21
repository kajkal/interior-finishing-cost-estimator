import { AuthService } from '../../../code/services/auth/AuthService';


export class AuthServiceSpiesManager {

    static setAccessToken: jest.SpiedFunction<typeof AuthService.prototype.setAccessToken>;

    static setupSpies() {
        this.restoreSpies();
        this.setAccessToken = jest.spyOn(AuthService.prototype, 'setAccessToken');
    }

    private static restoreSpies() {
        this.setAccessToken?.mockRestore();
    }

}
