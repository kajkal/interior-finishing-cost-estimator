import { Container } from 'typedi';
import { sign } from 'jsonwebtoken';

import { MockLogger } from '../../__mocks__/utils/logger';

import { useIntegrationTestsUtils } from '../../__utils__/integration-utils/useIntegrationTestsUtils';
import { UserRepositorySpy } from '../../__utils__/spies/repositories/UserRepositorySpy';
import { EmailServiceSpy } from '../../__utils__/spies/services/email/EmailServiceSpy';
import { PasswordResetTokenManagerSpy } from '../../__utils__/spies/services/password-reset/PasswordResetTokenManagerSpy';
import { generator } from '../../__utils__/generator';

import { PasswordResetService } from '../../../src/services/password-reset/PasswordResetService';
import { PasswordResetFormData } from '../../../src/resolvers/user/input/PasswordResetFormData';
import { User } from '../../../src/entities/user/User';


describe('PasswordResetResolver', () => {

    const testUtils = useIntegrationTestsUtils();

    beforeEach(async () => {
        MockLogger.setupMocks();

        // repositories
        UserRepositorySpy.setupSpies();

        // token managers
        PasswordResetTokenManagerSpy.setupSpies();

        // services
        EmailServiceSpy.setupSpiesAndMockImplementations();
    });

    describe('send password reset instructions mutation', () => {

        const sendPasswordResetInstructionsMutation = `
            mutation SendPasswordResetInstructions($email: String!) {
              sendPasswordResetInstructions(email: $email)
            }
        `;

        it('should send email with password reset instructions when user email address is confirmed', async (done) => {
            const user = await testUtils.db.populateWithUser({ isEmailAddressConfirmed: true });
            const response = await testUtils.postGraphQL({
                query: sendPasswordResetInstructionsMutation,
                variables: { email: user.email },
            });

            // verify if the database was queried
            expect(UserRepositorySpy.findOne).toHaveBeenCalledTimes(1);
            expect(UserRepositorySpy.findOne).toHaveBeenCalledWith({ email: user.email });

            // verify if 'Password reset instructions' email was send
            expect(EmailServiceSpy.sendPasswordResetInstructionsEmail).toHaveBeenCalledTimes(1);
            expect(EmailServiceSpy.sendPasswordResetInstructionsEmail).toHaveBeenCalledWith(user);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    sendPasswordResetInstructions: true,
                },
            });
            done();
        });

        it('should log error when user email address is not confirmed', async (done) => {
            const user = await testUtils.db.populateWithUser({ isEmailAddressConfirmed: false });
            const response = await testUtils.postGraphQL({
                query: sendPasswordResetInstructionsMutation,
                variables: { email: user.email },
            });

            // verify if the database was queried
            expect(UserRepositorySpy.findOne).toHaveBeenCalledTimes(1);
            expect(UserRepositorySpy.findOne).toHaveBeenCalledWith({ email: user.email });

            // verify if 'Password reset instructions' email was not send
            expect(EmailServiceSpy.sendPasswordResetInstructionsEmail).toHaveBeenCalledTimes(0);

            // verify if warning information was logged
            expect(MockLogger.warn).toHaveBeenCalledTimes(1);
            expect(MockLogger.warn).toHaveBeenCalledWith('cannot send reset password instructions', {
                email: user.email,
                isRegistered: true,
                isEmailAddressConfirmed: false,
            });

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    sendPasswordResetInstructions: true,
                },
            });
            done();
        });

        it('should log error when user with given email address is not registered', async (done) => {
            const response = await testUtils.postGraphQL({
                query: sendPasswordResetInstructionsMutation,
                variables: { email: 'not.registered@domain.com' },
            });

            // verify if the database was queried
            expect(UserRepositorySpy.findOne).toHaveBeenCalledTimes(1);
            expect(UserRepositorySpy.findOne).toHaveBeenCalledWith({ email: 'not.registered@domain.com' });

            // verify if 'Password reset instructions' email was not send
            expect(EmailServiceSpy.sendPasswordResetInstructionsEmail).toHaveBeenCalledTimes(0);

            // verify if warning information was logged
            expect(MockLogger.warn).toHaveBeenCalledTimes(1);
            expect(MockLogger.warn).toHaveBeenCalledWith('cannot send reset password instructions', {
                email: 'not.registered@domain.com',
                isRegistered: false,
                isEmailAddressConfirmed: undefined,
            });

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    sendPasswordResetInstructions: true,
                },
            });
            done();
        });

    });

    describe('reset password mutation', () => {

        const resetPasswordMutation = `
           mutation ResetPassword($token: String!, $password: String!) {
              resetPassword(token: $token, password: $password)
            }
        `;

        function createSamplePasswordResetToken(userData: Pick<User, 'id'>) {
            return Container.get(PasswordResetService).generatePasswordResetToken(userData);
        }

        it('should change user password if token is valid', async (done) => {
            const user = await testUtils.db.populateWithUser();
            const initialEncryptedPassword = user.password;
            const passwordResetFormData: PasswordResetFormData = {
                token: createSamplePasswordResetToken(user),
                password: generator.string({ length: 8 }),
            };
            const response = await testUtils.postGraphQL({
                query: resetPasswordMutation,
                variables: passwordResetFormData,
            });

            // verify if token was verified
            expect(PasswordResetTokenManagerSpy.verify).toHaveBeenCalledTimes(1);
            expect(PasswordResetTokenManagerSpy.verify).toHaveBeenCalledWith(passwordResetFormData.token);

            // verify if the database was queried
            expect(UserRepositorySpy.findOneOrFail).toHaveBeenCalledTimes(1);
            expect(UserRepositorySpy.findOneOrFail).toHaveBeenCalledWith({ id: user.id });

            // verify if user' password was updated
            expect(UserRepositorySpy.persistAndFlush).toHaveBeenCalledTimes(1);
            expect(user.unencryptedPassword).not.toBe(passwordResetFormData.password);
            expect(initialEncryptedPassword).not.toBe(user.password);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    resetPassword: true,
                },
            });
            done();
        });

        it('should return error if token is expired', async (done) => {
            const user = await testUtils.db.populateWithUser();
            jest.spyOn(Date, 'now').mockReturnValue(1592334600000); // 2020-06-16 19:10:00 <- creation time
            const passwordResetFormData: PasswordResetFormData = {
                token: createSamplePasswordResetToken(user),
                password: generator.string({ length: 8 }),
            };
            jest.spyOn(Date, 'now').mockReturnValue(1592342100000); // 2020-06-16 21:15:00 <- now
            const response = await testUtils.postGraphQL({
                query: resetPasswordMutation,
                variables: passwordResetFormData,
            });

            // verify if token was verified
            expect(PasswordResetTokenManagerSpy.verify).toHaveBeenCalledTimes(1);
            expect(PasswordResetTokenManagerSpy.verify).toHaveBeenCalledWith(passwordResetFormData.token);

            // verify if database was not queried and user password was not updated
            expect(UserRepositorySpy.findOneOrFail).toHaveBeenCalledTimes(0);
            expect(UserRepositorySpy.persistAndFlush).toHaveBeenCalledTimes(0);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access-error' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: null,
                errors: [
                    expect.objectContaining({
                        message: 'EXPIRED_PASSWORD_RESET_TOKEN',
                        extensions: expect.objectContaining({
                            expiredAt: '2020-06-16T21:10:00.000Z',
                        }),
                    }),
                ],
            });
            jest.spyOn(Date, 'now').mockRestore();
            done();
        });

        it('should return error if token is invalid', async (done) => {
            const passwordResetFormData: PasswordResetFormData = {
                token: sign({ id: 'sample id' }, 'WRONG_PRIVATE_KEY'),
                password: generator.string({ length: 8 }),
            };
            const response = await testUtils.postGraphQL({
                query: resetPasswordMutation,
                variables: passwordResetFormData,
            });

            // verify if token was verified
            expect(PasswordResetTokenManagerSpy.verify).toHaveBeenCalledTimes(1);
            expect(PasswordResetTokenManagerSpy.verify).toHaveBeenCalledWith(passwordResetFormData.token);

            // verify if database was not queried and user password was not updated
            expect(UserRepositorySpy.findOneOrFail).toHaveBeenCalledTimes(0);
            expect(UserRepositorySpy.persistAndFlush).toHaveBeenCalledTimes(0);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access-error' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: null,
                errors: [
                    expect.objectContaining({
                        message: 'INVALID_PASSWORD_RESET_TOKEN',
                    }),
                ],
            });
            done();
        });

    });

});
