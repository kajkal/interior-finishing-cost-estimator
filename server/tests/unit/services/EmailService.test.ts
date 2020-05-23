import 'reflect-metadata';

import { MockLogger } from '../../__mocks__/utils/logger';
import { MockMailService } from '../../__mocks__/libraries/sendgrid';

import { AccountServiceSpiesManager } from '../../__utils__/spies-managers/AccountServiceSpiesManager';

import { EmailService } from '../../../src/services/EmailService';
import { Container } from 'typedi';


describe('EmailService class', () => {

    const serviceUnderTest = Container.of('test').get(EmailService);

    beforeEach(() => {
        MockLogger.setupMocks();
        MockMailService.setupMocks();
        AccountServiceSpiesManager.setupSpies();
    });

    describe('\'Confirm your email address\' email', () => {

        const emailAddressConfirmationUrl = 'TEST_EMAIL_ADDRESS_CONFIRMATION';
        const userData = {
            id: 'TEST_USER_ID',
            name: 'TEST_USER_NAME',
            email: 'TEST_USER_EMAIL',
        };

        it('should successfully send email', async () => {
            expect.assertions(4);

            // given
            AccountServiceSpiesManager.generateEmailAddressConfirmationUrl.mockReturnValue(emailAddressConfirmationUrl);

            // when
            await serviceUnderTest.sendConfirmEmailAddressEmail(userData);

            // then
            expect(MockMailService.send).toHaveBeenCalledTimes(1);
            expect(MockMailService.send).toHaveBeenCalledWith({
                from: expect.any(Object),
                to: { name: userData.name, email: userData.email },
                templateId: expect.any(String),
                dynamicTemplateData: {
                    name: userData.name,
                    confirmationLink: emailAddressConfirmationUrl,
                },
            });
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith('email-send', expect.objectContaining({ to: userData.email }));
        });

        it('should log error', async () => {
            expect.assertions(3);

            // given
            AccountServiceSpiesManager.generateEmailAddressConfirmationUrl.mockReturnValue(emailAddressConfirmationUrl);
            MockMailService.send.mockImplementation(() => {
                throw new Error();
            });

            // when
            await serviceUnderTest.sendConfirmEmailAddressEmail(userData);

            // then
            expect(MockMailService.send).toHaveBeenCalledTimes(1);
            expect(MockLogger.error).toHaveBeenCalledTimes(1);
            expect(MockLogger.error).toHaveBeenCalledWith('email-send-error', expect.any(Object));
        });

    });

});
