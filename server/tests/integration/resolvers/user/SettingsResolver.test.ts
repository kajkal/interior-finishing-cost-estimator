import { MockLogger } from '../../../__mocks__/utils/logger';
import { useIntegrationTestsUtils } from '../../../__utils__/integration-utils/useIntegrationTestsUtils';
import { useValidationUtils } from '../../../__utils__/integration-utils/useValidationUtils';
import { UserRepositorySpy } from '../../../__utils__/spies/repositories/UserRepositorySpy';
import { EmailServiceSpy } from '../../../__utils__/spies/services/email/EmailServiceSpy';
import { getAuthHeader } from '../../../__utils__/integration-utils/authUtils';
import { generator } from '../../../__utils__/generator';

import { ChangeProfileSettingsFormData } from '../../../../src/resolvers/user/input/ChangeProfileSettingsFormData';
import { ChangePasswordFormData } from '../../../../src/resolvers/user/input/ChangePasswordFormData';
import { ChangeEmailFormData } from '../../../../src/resolvers/user/input/ChangeEmailFormData';
import { SettingsResolver } from '../../../../src/resolvers/user/SettingsResolver';
import { User } from '../../../../src/entities/user/User';


describe('SettingsResolver', () => {

    const testUtils = useIntegrationTestsUtils();

    beforeEach(() => {
        MockLogger.setupMocks();

        // repositories
        UserRepositorySpy.setupSpies();

        // services
        EmailServiceSpy.setupSpiesAndMockImplementations();
    });

    describe('change email mutation', () => {

        const changeEmailMutation = `
            mutation ChangeEmail($email: String!) {
              changeEmail(email: $email)
            }
        `;

        describe('validation', () => {

            const send = useValidationUtils<ChangeEmailFormData>({
                testUtils,
                resolverSpy: jest.spyOn(SettingsResolver.prototype, 'changeEmail'),
                query: changeEmailMutation,
                validFormData: {
                    email: 'valid.email@domain.com',
                },
            });

            it('should return error when user is not authenticated', async () => {
                await send.withoutAuth().expectNotAuthorizedError();
            });

            it('should validate email', async () => {
                // should accept valid
                await send.withAuth({ email: 'valid.email@domain.com' }).expectValidationSuccess();
                await send.withAuth({ email: 'valid_email@domain.com' }).expectValidationSuccess();
                await send.withAuth({ email: 'valid_email+1@domain.com' }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ email: 'invalid-email' }).expectValidationError('email');
                await send.withAuth({ email: 'invalid.email@domain' }).expectValidationError('email');
                await send.withAuth({ email: 'invalid.email.domain.com' }).expectValidationError('email');
            });

        });

        it('should change user email and send email with confirmation link ', async () => {
            const user = await testUtils.db.populateWithUser({
                isEmailAddressConfirmed: true,
            });
            const formData: ChangeEmailFormData = {
                email: 'updated_email@domain.com',
            };
            const response = await testUtils.postGraphQL({
                query: changeEmailMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));

            // verify if new email was saved in db
            expect(UserRepositorySpy.persistAndFlush).toHaveBeenCalledTimes(1);
            expect(UserRepositorySpy.persistAndFlush).toHaveBeenCalledWith(expect.objectContaining({
                id: user.id,
                email: formData.email,
                isEmailAddressConfirmed: false,
            }));

            // verify if 'Confirm your email address' email was send
            expect(EmailServiceSpy.sendConfirmEmailAddressEmail).toHaveBeenCalledTimes(1);
            expect(EmailServiceSpy.sendConfirmEmailAddressEmail).toHaveBeenCalledWith(expect.objectContaining({
                name: user.name,
                email: formData.email,
            }));

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    changeEmail: true,
                },
            });
        });

        it('should return error when new email address is not available', async () => {
            const user = await testUtils.db.populateWithUser();
            const otherUser = await testUtils.db.populateWithUser();
            const formData: ChangeEmailFormData = {
                email: otherUser.email,
            };
            const response = await testUtils.postGraphQL({
                query: changeEmailMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access-error' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: null,
                errors: [
                    expect.objectContaining({
                        message: 'EMAIL_NOT_AVAILABLE',
                    }),
                ],
            });
        });

    });

    describe('change password mutation', () => {

        const changePasswordMutation = `
            mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
              changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
            }
        `;

        describe('validation', () => {

            const send = useValidationUtils<ChangePasswordFormData>({
                testUtils,
                resolverSpy: jest.spyOn(SettingsResolver.prototype, 'changePassword'),
                query: changePasswordMutation,
                validFormData: {
                    currentPassword: 'valid current password',
                    newPassword: 'valid new password',
                },
            });

            it('should return error when user is not authenticated', async () => {
                await send.withoutAuth().expectNotAuthorizedError();
            });

            it('should validate current password', async () => {
                // should accept valid
                await send.withAuth({ currentPassword: 'a'.repeat(6) }).expectValidationSuccess();
                await send.withAuth({ currentPassword: 'a'.repeat(255) }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ currentPassword: 'a'.repeat(5) }).expectValidationError('currentPassword');
                await send.withAuth({ currentPassword: 'a'.repeat(256) }).expectValidationError('currentPassword');
            });

            it('should validate new password', async () => {
                // should accept valid
                await send.withAuth({ newPassword: 'a'.repeat(6) }).expectValidationSuccess();
                await send.withAuth({ newPassword: 'a'.repeat(255) }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ newPassword: 'a'.repeat(5) }).expectValidationError('newPassword');
                await send.withAuth({ newPassword: 'a'.repeat(256) }).expectValidationError('newPassword');
            });

        });
        
        it('should change user password', async () => {
            const currentPassword = generator.string({ length: 8 });
            const user = await testUtils.db.populateWithUser({
                password: currentPassword,
            });
            const formData: ChangePasswordFormData = {
                currentPassword,
                newPassword: generator.string({ length: 8 }),
            };
            const response = await testUtils.postGraphQL({
                query: changePasswordMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));

            // verify if user' password was updated
            expect(UserRepositorySpy.persistAndFlush).toHaveBeenCalledTimes(1);
            const updatedUser = UserRepositorySpy.persistAndFlush.mock.calls[0][0] as User;
            expect(formData.currentPassword).not.toBe(formData.newPassword);
            expect(user.password).not.toBe(updatedUser.password);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    changePassword: true,
                },
            });
        });
        
        it('should return error when current password is incorrect', async () => {
            const user = await testUtils.db.populateWithUser();
            const formData: ChangePasswordFormData = {
                currentPassword: 'incorrect password',
                newPassword: generator.string({ length: 8 }),
            };
            const response = await testUtils.postGraphQL({
                query: changePasswordMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));

            // verify if user' password was not updated
            expect(UserRepositorySpy.persistAndFlush).toHaveBeenCalledTimes(0);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access-error' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: null,
                errors: [
                    expect.objectContaining({
                        message: 'INVALID_CURRENT_PASSWORD',
                    }),
                ],
            });
        });

    });

    describe('change profile settings mutation', () => {

        const changeProfileSettingsMutation = `
            mutation ChangeProfileSettings($hidden: Boolean!) {
              changeProfileSettings(hidden: $hidden)
            }
        `;

        describe('validation', () => {

            const send = useValidationUtils<ChangeProfileSettingsFormData>({
                testUtils,
                resolverSpy: jest.spyOn(SettingsResolver.prototype, 'changeProfileSettings'),
                query: changeProfileSettingsMutation,
                validFormData: {
                    hidden: true,
                },
            });

            it('should return error when user is not authenticated', async () => {
                await send.withoutAuth().expectNotAuthorizedError();
            });

            it('should validate hidden flag', async () => {
                // should accept valid
                await send.withAuth({ hidden: false }).expectValidationSuccess();
                await send.withAuth({ hidden: true }).expectValidationSuccess();
            });

        });

        it('should change user profile settings', async () => {
            const user = await testUtils.db.populateWithUser({
                hidden: false,
            });
            const formData: ChangeProfileSettingsFormData = {
                hidden: true,
            };
            const response = await testUtils.postGraphQL({
                query: changeProfileSettingsMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));

            // verify if flag value was saved in db
            expect(UserRepositorySpy.persistAndFlush).toHaveBeenCalledTimes(1);
            expect(UserRepositorySpy.persistAndFlush).toHaveBeenCalledWith(expect.objectContaining({
                hidden: true,
            }));

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    changeProfileSettings: true,
                },
            });
        });

    });

});
