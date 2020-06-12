import jwt from 'jsonwebtoken';
import { Container } from 'typedi';

import { EmailAddressConfirmationTokenManager } from '../../../src/services/email-address-confirmation/EmailAddressConfirmationTokenManager';
import { PasswordResetTokenManager } from '../../../src/services/password-reset/PasswordResetTokenManager';
import { RefreshTokenManager } from '../../../src/services/auth/RefreshTokenManager';
import { AccessTokenManager } from '../../../src/services/auth/AccessTokenManager';
import { TokenConfig } from '../../../src/types/token/TokenConfig';
import { TokenManager } from '../../../src/services/TokenManager';
import { config } from '../../../src/config/config';


describe('TokenManager class', () => {

    let signSpy: jest.SpiedFunction<typeof jwt.sign>;
    let verifySpy: jest.SpiedFunction<typeof jwt.verify>;

    beforeEach(() => {
        signSpy?.mockRestore();
        verifySpy?.mockRestore();
        signSpy = jest.spyOn(jwt, 'sign');
        verifySpy = jest.spyOn(jwt, 'verify');
    });

    function expectToWorkCorrectly<P extends object>(tokenManager: TokenManager<P>, expectedConfig: TokenConfig<P>) {
        const initialPayload = { claim: 'value' } as P;
        const token = tokenManager.generate(initialPayload);
        const extractedPayload = tokenManager.verify(token);

        expect(token).toMatch(/^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/);
        expect(extractedPayload).toMatchObject(initialPayload);

        expect(signSpy).toHaveBeenCalledTimes(1);
        const [ payload, signPrivateKey, options ] = signSpy.mock.calls[ 0 ];
        expect(payload).toBe(initialPayload);
        expect(signPrivateKey).toBe(expectedConfig.privateKey);
        expect(options).toBe(expectedConfig.options);

        expect(verifySpy).toHaveBeenCalledTimes(1);
        const [ tokenToVerify, verifyPrivateKey ] = verifySpy.mock.calls[ 0 ];
        expect(tokenToVerify).toBe(token);
        expect(verifyPrivateKey).toBe(expectedConfig.privateKey);
    }

    it('should manage access token', () => {
        expectToWorkCorrectly(Container.get(AccessTokenManager), config.token.access.jwt);
    });

    it('should manage refresh token', () => {
        expectToWorkCorrectly(Container.get(RefreshTokenManager), config.token.refresh.jwt);
    });

    it('should manage email address confirmation token', () => {
        expectToWorkCorrectly(Container.get(EmailAddressConfirmationTokenManager), config.token.emailAddressConfirmation.jwt);
    });

    it('should manage password reset token', () => {
        expectToWorkCorrectly(Container.get(PasswordResetTokenManager), config.token.passwordReset.jwt);
    });

});
