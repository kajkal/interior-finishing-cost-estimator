import { TokenManager } from '../../../src/services/TokenService';
import { AccessTokenPayload } from '../../../src/types/token/AccessTokenPayload';
import { RefreshTokenPayload } from '../../../src/types/token/RefreshTokenPayload';
import { EmailAddressConfirmationTokenPayload } from '../../../src/types/token/EmailAddressConfirmationTokenPayload';
import { PasswordResetTokenPayload } from '../../../src/types/token/PasswordResetTokenPayload';


class TokenManagerMockManager<P extends object> {

    constructor(
        public generate: jest.MockedFunction<TokenManager<P>['generate']>,
        public verify: jest.MockedFunction<TokenManager<P>['verify']>,
    ) {
    }

    static setupMocks() {
        return new this(jest.fn(), jest.fn());
    }

}

export class MockTokenService {

    static accessToken: TokenManagerMockManager<AccessTokenPayload>;
    static refreshToken: TokenManagerMockManager<RefreshTokenPayload>;
    static emailAddressConfirmationToken: TokenManagerMockManager<EmailAddressConfirmationTokenPayload>;
    static passwordResetToken: TokenManagerMockManager<PasswordResetTokenPayload>;

    static setupMocks() {
        this.accessToken = TokenManagerMockManager.setupMocks();
        this.refreshToken = TokenManagerMockManager.setupMocks();
        this.emailAddressConfirmationToken = TokenManagerMockManager.setupMocks();
        this.passwordResetToken = TokenManagerMockManager.setupMocks();
    }

}
