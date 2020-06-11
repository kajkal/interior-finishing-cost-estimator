import { Container } from 'typedi';

import { EmailAddressConfirmationTokenPayload } from '../../../src/types/token/EmailAddressConfirmationTokenPayload';
import { PasswordResetTokenPayload } from '../../../src/types/token/PasswordResetTokenPayload';
import { RefreshTokenPayload } from '../../../src/types/token/RefreshTokenPayload';
import { AccessTokenPayload } from '../../../src/types/token/AccessTokenPayload';
import { TokenManager, TokenService } from '../../../src/services/TokenService';


export interface TokenManagerSpiesManager<P extends object> {
    generate: jest.SpiedFunction<TokenManager<P>['generate']>;
    verify: jest.SpiedFunction<TokenManager<P>['verify']>;
    mockImplementation: () => void;
    restoreSpies: () => void;
}

function createTokenManagerSpiesManager<P extends object>(tokenManager: TokenManager<P>): TokenManagerSpiesManager<P> {
    const spies = {
        generate: jest.spyOn(tokenManager, 'generate'),
        verify: jest.spyOn(tokenManager, 'verify'),
    };
    return {
        ...spies,
        mockImplementation: () => {
            spies.generate.mockImplementation();
            spies.verify.mockImplementation();
        },
        restoreSpies: () => {
            spies.generate.mockRestore();
            spies.verify.mockRestore();
        },
    };
}

export class TokenServiceSpiesManager {

    static accessToken: TokenManagerSpiesManager<AccessTokenPayload>;
    static refreshToken: TokenManagerSpiesManager<RefreshTokenPayload>;
    static emailAddressConfirmationToken: TokenManagerSpiesManager<EmailAddressConfirmationTokenPayload>;
    static passwordResetToken: TokenManagerSpiesManager<PasswordResetTokenPayload>;

    static setupSpies() {
        this.restoreSpies();
        const tokenService = Container.get(TokenService);
        this.accessToken = createTokenManagerSpiesManager(tokenService.accessToken);
        this.refreshToken = createTokenManagerSpiesManager(tokenService.refreshToken);
        this.emailAddressConfirmationToken = createTokenManagerSpiesManager(tokenService.emailAddressConfirmationToken);
        this.passwordResetToken = createTokenManagerSpiesManager(tokenService.passwordResetToken);
    }

    static setupSpiesAndMockImplementations() {
        this.setupSpies();
        this.accessToken.mockImplementation();
        this.refreshToken.mockImplementation();
        this.emailAddressConfirmationToken.mockImplementation();
        this.passwordResetToken.mockImplementation();
    }

    private static restoreSpies() {
        this.accessToken?.restoreSpies();
        this.refreshToken?.restoreSpies();
        this.emailAddressConfirmationToken?.restoreSpies();
        this.passwordResetToken?.restoreSpies();
    }

}
