import 'reflect-metadata';
import { Container } from 'typedi';
import { EmailAddressConfirmationTokenManagerSpy } from '../../../__utils__/spies/services/email-address-confirmation/EmailAddressConfirmationTokenManagerSpy';
import { EmailAddressConfirmationService } from '../../../../src/services/email-address-confirmation/EmailAddressConfirmationService';


describe('EmailAddressConfirmationService class', () => {

    let serviceUnderTest: EmailAddressConfirmationService;

    beforeAll(() => {
        serviceUnderTest = Container.get(EmailAddressConfirmationService);
    });

    beforeEach(() => {
        EmailAddressConfirmationTokenManagerSpy.setupSpiesAndMockImplementations();
    });

    it('should generate new email address confirmation token', () => {
        // given
        const userData = { id: 'TEST_USER_ID' };

        // when
        serviceUnderTest.generateEmailAddressConfirmationToken(userData);

        // then
        expect(EmailAddressConfirmationTokenManagerSpy.generate).toHaveBeenCalledTimes(1);
        expect(EmailAddressConfirmationTokenManagerSpy.generate).toHaveBeenCalledWith({ sub: 'TEST_USER_ID' });
    });

    it('should generate email address confirmation url', () => {
        // given
        const userData = { id: 'TEST_USER_ID' };
        jest.spyOn(serviceUnderTest, 'generateEmailAddressConfirmationToken').mockReturnValueOnce('TOKEN_TEST_VALUE');

        // when
        const confirmationUrl = serviceUnderTest.generateEmailAddressConfirmationUrl(userData);

        // then
        expect(confirmationUrl).toBe('http://localhost:3005/signup/confirm-email-address?token=TOKEN_TEST_VALUE');
        expect(serviceUnderTest.generateEmailAddressConfirmationToken).toHaveBeenCalledTimes(1);
        expect(serviceUnderTest.generateEmailAddressConfirmationToken).toHaveBeenCalledWith(userData);
    });

    it('should verify email address confirmation token', () => {
        // given
        const tokenToVerify = 'TOKEN_TEST_VALUE';

        // when
        serviceUnderTest.verifyEmailAddressConfirmationToken(tokenToVerify);

        // then
        expect(EmailAddressConfirmationTokenManagerSpy.verify).toHaveBeenCalledTimes(1);
        expect(EmailAddressConfirmationTokenManagerSpy.verify).toHaveBeenCalledWith(tokenToVerify);
    });

});
