import 'reflect-metadata';

import { Container } from 'typedi';

import { MockLogger } from '../../../__mocks__/utils/logger';
import { MockMailService } from '../../../__mocks__/libraries/sendgrid';

import { EmailAddressConfirmationServiceSpy } from '../../../__utils__/spies/services/email-address-confirmation/EmailAddressConfirmationServiceSpy';
import { PasswordResetServiceSpy } from '../../../__utils__/spies/services/password-reset/PasswordResetServiceSpy';

import { EmailService } from '../../../../src/services/email/EmailService';


describe('EmailService class', () => {

    const serviceUnderTest = Container.get(EmailService);
    const sampleUserData = {
        id: 'TEST_USER_ID',
        name: 'TEST_USER_NAME',
        email: 'TEST_USER_EMAIL',
    };

    beforeEach(() => {
        MockLogger.setupMocks();
        MockMailService.setupMocks();
        EmailAddressConfirmationServiceSpy.setupSpies();
        PasswordResetServiceSpy.setupSpies();
    });

    describe('\'Confirm your email address\' email', () => {

        beforeEach(() => {
            EmailAddressConfirmationServiceSpy.generateEmailAddressConfirmationUrl.mockReturnValue('EMAIL_ADDRESS_CONFIRMATION_URL_TEST_VALUE');
        });

        it('should successfully send email', async (done) => {
            // given/when
            await serviceUnderTest.sendConfirmEmailAddressEmail(sampleUserData);

            // then
            expect(MockMailService.send).toHaveBeenCalledTimes(1);
            expect(MockMailService.send).toHaveBeenCalledWith({
                from: expect.any(Object),
                to: { name: sampleUserData.name, email: sampleUserData.email },
                templateId: expect.any(String),
                dynamicTemplateData: {
                    name: sampleUserData.name,
                    confirmationLink: 'EMAIL_ADDRESS_CONFIRMATION_URL_TEST_VALUE',
                },
            });
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith('email-send', expect.objectContaining({ to: sampleUserData.email }));
            done();
        });

        it('should log error', async (done) => {
            // given
            MockMailService.send.mockImplementationOnce(() => {
                throw new Error();
            });

            // when
            await serviceUnderTest.sendConfirmEmailAddressEmail(sampleUserData);

            // then
            expect(MockMailService.send).toHaveBeenCalledTimes(1);
            expect(MockLogger.error).toHaveBeenCalledTimes(1);
            expect(MockLogger.error).toHaveBeenCalledWith('email-send-error', expect.any(Object));
            done();
        });

    });

    describe('\'Password reset instructions\' email ', () => {

        beforeEach(() => {
            PasswordResetServiceSpy.generatePasswordResetUrl.mockReturnValue('PASSWORD_RESET_URL_TEST_VALUE');
        });

        it('should successfully send email', async (done) => {
            // given/when
            await serviceUnderTest.sendPasswordResetInstructionsEmail(sampleUserData);

            // then
            expect(MockMailService.send).toHaveBeenCalledTimes(1);
            expect(MockMailService.send).toHaveBeenCalledWith({
                from: expect.any(Object),
                to: { name: sampleUserData.name, email: sampleUserData.email },
                templateId: expect.any(String),
                dynamicTemplateData: {
                    name: sampleUserData.name,
                    email: sampleUserData.email,
                    passwordResetLink: 'PASSWORD_RESET_URL_TEST_VALUE',
                },
            });
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith('email-send', expect.objectContaining({ to: sampleUserData.email }));
            done();
        });

        it('should log error', async (done) => {
            // given
            MockMailService.send.mockImplementationOnce(() => {
                throw new Error();
            });

            // when
            await serviceUnderTest.sendPasswordResetInstructionsEmail(sampleUserData);

            // then
            expect(MockMailService.send).toHaveBeenCalledTimes(1);
            expect(MockLogger.error).toHaveBeenCalledTimes(1);
            expect(MockLogger.error).toHaveBeenCalledWith('email-send-error', expect.any(Object));
            done();
        });

    });

});
