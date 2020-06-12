import 'reflect-metadata';
import { Container } from 'typedi';
import { PasswordResetTokenManagerSpy } from '../../../__utils__/spies/services/password-reset/PasswordResetTokenManagerSpy';
import { PasswordResetService } from '../../../../src/services/password-reset/PasswordResetService';


describe('PasswordResetService class', () => {

    let serviceUnderTest: PasswordResetService;

    beforeAll(() => {
        serviceUnderTest = Container.get(PasswordResetService);
    });

    beforeEach(() => {
        PasswordResetTokenManagerSpy.setupSpiesAndMockImplementations();
    });

    it('should generate new password reset token', () => {
        // given
        const userData = { id: 'TEST_USER_ID' };

        // when
        serviceUnderTest.generatePasswordResetToken(userData);

        // then
        expect(PasswordResetTokenManagerSpy.generate).toHaveBeenCalledTimes(1);
        expect(PasswordResetTokenManagerSpy.generate).toHaveBeenCalledWith({ sub: 'TEST_USER_ID' });
    });

    it('should generate password reset url', () => {
        // given
        const userData = { id: 'TEST_USER_ID' };
        jest.spyOn(serviceUnderTest, 'generatePasswordResetToken').mockReturnValueOnce('TOKEN_TEST_VALUE');

        // when
        const confirmationUrl = serviceUnderTest.generatePasswordResetUrl(userData);

        // then
        expect(confirmationUrl).toBe('http://localhost:3005/reset-password?token=TOKEN_TEST_VALUE');
        expect(serviceUnderTest.generatePasswordResetToken).toHaveBeenCalledTimes(1);
        expect(serviceUnderTest.generatePasswordResetToken).toHaveBeenCalledWith(userData);
    });

    it('should verify password reset token', () => {
        // given
        const tokenToVerify = 'TOKEN_TEST_VALUE';

        // when
        serviceUnderTest.verifyPasswordResetToken(tokenToVerify);

        // then
        expect(PasswordResetTokenManagerSpy.verify).toHaveBeenCalledTimes(1);
        expect(PasswordResetTokenManagerSpy.verify).toHaveBeenCalledWith(tokenToVerify);
    });

});
