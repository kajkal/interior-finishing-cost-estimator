import { JsonWebTokenSpiesManager } from '../../__utils__/spies-managers/JsonWebTokenSpiesManager';
import { AccountService } from '../../../src/services/AccountService';


describe('AccountService class', () => {

    const jwtRegExp = /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/;
    const serviceUnderTest = new AccountService();

    beforeEach(() => {
        JsonWebTokenSpiesManager.setupSpies();
    });

    describe('email address confirmation token', () => {

        it('should generate email address confirmation link url', () => {
            const userData = { id: 'TEST_USER_ID' };

            // verify url generation
            const confirmationUrl = serviceUnderTest.generateEmailAddressConfirmationUrl(userData);

            expect(confirmationUrl).toMatch(/WEB_CLIENT_URL_TEST_VALUE\/confirm-email-address\?token=.*/);
            expect(JsonWebTokenSpiesManager.sign).toHaveBeenCalledTimes(1);
            expect(JsonWebTokenSpiesManager.sign).toHaveBeenCalledWith(
                { sub: 'TEST_USER_ID' },
                'EMAIL_ADDRESS_CONFIRMATION_TOKEN_PRIVATE_KEY_TEST_VALUE',
                { noTimestamp: true },
            );

            // extract token from url
            const emailAddressConfirmationToken = confirmationUrl.split('?token=')[ 1 ];
            expect(emailAddressConfirmationToken).toMatch(jwtRegExp);

            // verify generated token
            const extractedPayload = serviceUnderTest.verifyEmailAddressConfirmationToken(emailAddressConfirmationToken);

            expect(extractedPayload).toEqual({ sub: 'TEST_USER_ID' });
            expect(JsonWebTokenSpiesManager.verify).toHaveBeenCalledTimes(1);
            expect(JsonWebTokenSpiesManager.verify).toHaveBeenCalledWith(
                emailAddressConfirmationToken,
                'EMAIL_ADDRESS_CONFIRMATION_TOKEN_PRIVATE_KEY_TEST_VALUE',
            );
        });

    });

});
