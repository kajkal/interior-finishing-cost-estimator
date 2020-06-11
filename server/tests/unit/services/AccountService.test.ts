import 'reflect-metadata';

import { Container } from 'typedi';

import { MockTokenService } from '../../__utils__/mocks/MockTokenService';

import { AccountService } from '../../../src/services/AccountService';
import { TokenService } from '../../../src/services/TokenService';


describe('AccountService class', () => {

    let serviceUnderTest: AccountService;

    beforeAll(() => {
        Container.set(TokenService, MockTokenService);
        serviceUnderTest = Container.get(AccountService);
    });

    beforeEach(() => {
        MockTokenService.setupMocks();
    });

    describe('email address confirmation token', () => {

        it('should generate new email address confirmation token', () => {
            // given
            const userData = { id: 'TEST_USER_ID' };

            // when
            serviceUnderTest.generateEmailAddressConfirmationToken(userData);

            // then
            expect(MockTokenService.emailAddressConfirmationToken.generate).toHaveBeenCalledTimes(1);
            expect(MockTokenService.emailAddressConfirmationToken.generate).toHaveBeenCalledWith({ sub: 'TEST_USER_ID' });
        });

        it('should generate email address confirmation url', () => {
            // given
            const userData = { id: 'TEST_USER_ID' };
            jest.spyOn(serviceUnderTest, 'generateEmailAddressConfirmationToken').mockReturnValueOnce('TOKEN_TEST_VALUE');

            // when
            const confirmationUrl = serviceUnderTest.generateEmailAddressConfirmationUrl(userData);

            // then
            expect(confirmationUrl).toBe('http://localhost:3005/confirm-email-address?token=TOKEN_TEST_VALUE');
            expect(serviceUnderTest.generateEmailAddressConfirmationToken).toHaveBeenCalledTimes(1);
            expect(serviceUnderTest.generateEmailAddressConfirmationToken).toHaveBeenCalledWith(userData);
        });

        it('should verify email address confirmation token', () => {
            // given
            const tokenToVerify = 'TOKEN_TEST_VALUE';

            // when
            serviceUnderTest.verifyEmailAddressConfirmationToken(tokenToVerify);

            // then
            expect(MockTokenService.emailAddressConfirmationToken.verify).toHaveBeenCalledTimes(1);
            expect(MockTokenService.emailAddressConfirmationToken.verify).toHaveBeenCalledWith(tokenToVerify);
        });

    });

});
