import { Container } from 'typedi';
import { sign } from 'jsonwebtoken';

import { MockLogger } from '../../../__mocks__/utils/logger';

import { EmailAddressConfirmationTokenManagerSpy } from '../../../__utils__/spies/services/email-address-confirmation/EmailAddressConfirmationTokenManagerSpy';
import { useIntegrationTestsUtils } from '../../../__utils__/integration-utils/useIntegrationTestsUtils';
import { RefreshTokenManagerSpy } from '../../../__utils__/spies/services/auth/RefreshTokenManagerSpy';
import { AccessTokenManagerSpy } from '../../../__utils__/spies/services/auth/AccessTokenManagerSpy';
import { useValidationUtils } from '../../../__utils__/integration-utils/useValidationUtils';
import { UserRepositorySpy } from '../../../__utils__/spies/repositories/UserRepositorySpy';
import { EmailServiceSpy } from '../../../__utils__/spies/services/email/EmailServiceSpy';
import { generator } from '../../../__utils__/generator';

import { EmailAddressConfirmationService } from '../../../../src/services/email-address-confirmation/EmailAddressConfirmationService';
import { EmailAddressConfirmationData } from '../../../../src/resolvers/user/input/EmailAddressConfirmationData';
import { RegisterFormData } from '../../../../src/resolvers/user/input/RegisterFormData';
import { RegisterResolver } from '../../../../src/resolvers/user/RegisterResolver';
import { User } from '../../../../src/entities/user/User';


describe('RegisterResolver', () => {

    const testUtils = useIntegrationTestsUtils();

    beforeEach(async () => {
        MockLogger.setupMocks();

        // repositories
        UserRepositorySpy.setupSpies();

        // token managers
        AccessTokenManagerSpy.setupSpies();
        RefreshTokenManagerSpy.setupSpies();
        EmailAddressConfirmationTokenManagerSpy.setupSpies();

        // services
        EmailServiceSpy.setupSpiesAndMockImplementations();
    });

    describe('register mutation', () => {

        const registerMutation = `
            mutation Register($name: String!, $email: String!, $password: String!) {
              register(name: $name, email: $email, password: $password) {
                accessToken
                user {
                  name
                  slug
                  email
                }
              }
            }
        `;

        describe('validation', () => {

            const send = useValidationUtils<RegisterFormData>({
                testUtils,
                resolverSpy: jest.spyOn(RegisterResolver.prototype, 'register'),
                query: registerMutation,
                validFormData: {
                    name: 'valid name',
                    email: 'valid.email@domain.com',
                    password: 'Secure password',
                },
            });

            it('should be accessible for unauthenticated users', async () => {
                await send.withoutAuth().expectValidationSuccess();
            });

            it('should validate name', async () => {
                // should accept valid
                await send.withAuth({ name: 'a'.repeat(3) }).expectValidationSuccess();
                await send.withAuth({ name: 'a'.repeat(255) }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ name: 'a'.repeat(2) }).expectValidationError('name');
                await send.withAuth({ name: 'a'.repeat(256) }).expectValidationError('name');
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

            it('should validate password', async () => {
                // should accept valid
                await send.withAuth({ password: 'a'.repeat(6) }).expectValidationSuccess();
                await send.withAuth({ password: 'a'.repeat(255) }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ password: 'a'.repeat(5) }).expectValidationError('password');
                await send.withAuth({ password: 'a'.repeat(256) }).expectValidationError('password');
            });

        });

        it('should create new user and return initial data if form data are valid', async () => {
            const registerFormData: RegisterFormData = {
                name: generator.name(),
                email: generator.email(),
                password: generator.string({ length: 8 }),
            };
            const response = await testUtils.postGraphQL({
                query: registerMutation,
                variables: registerFormData,
            });

            // verify if new user object was created and saved in db
            expect(UserRepositorySpy.create).toHaveBeenCalledTimes(1);
            expect(UserRepositorySpy.persistAndFlush).toHaveBeenCalledTimes(1);

            // verify if 'Confirm your email address' email was send
            expect(EmailServiceSpy.sendConfirmEmailAddressEmail).toHaveBeenCalledTimes(1);
            expect(EmailServiceSpy.sendConfirmEmailAddressEmail).toHaveBeenCalledWith(expect.objectContaining({
                name: registerFormData.name,
                email: registerFormData.email,
            }));

            // verify if refresh token was generated and added to cookie
            expect(RefreshTokenManagerSpy.generate).toHaveBeenCalledTimes(1);
            expect(RefreshTokenManagerSpy.generate).toHaveBeenCalledWith({ sub: expect.any(String) });
            expect(response.header[ 'set-cookie' ]).toEqual([
                expect.stringMatching(/^rt=.+; Path=\/refresh_token; Expires=.+; HttpOnly; SameSite=Strict$/),
            ]);

            // verify if access token was generated
            expect(AccessTokenManagerSpy.generate).toHaveBeenCalledTimes(1);
            expect(AccessTokenManagerSpy.generate).toHaveBeenCalledWith({ sub: expect.any(String) });

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    register: {
                        accessToken: expect.any(String),
                        user: {
                            name: registerFormData.name,
                            slug: registerFormData.name.toLowerCase().replace(/\s/g, '-'),
                            email: registerFormData.email,
                        },
                    },
                },
            });
        });

        it('should return error if user with given email address already exists', async () => {
            const existingUser = await testUtils.db.populateWithUser();
            const registerFormData: RegisterFormData = {
                name: generator.name(),
                email: existingUser.email,
                password: generator.string({ length: 8 }),
            };
            const response = await testUtils.postGraphQL({
                query: registerMutation,
                variables: registerFormData,
            });

            // verify if functions reserved for creating new user were not called
            expect(UserRepositorySpy.generateUniqueSlug).toHaveBeenCalledTimes(0);
            expect(UserRepositorySpy.create).toHaveBeenCalledTimes(0);
            expect(UserRepositorySpy.persistAndFlush).toHaveBeenCalledTimes(0);
            expect(EmailServiceSpy.sendConfirmEmailAddressEmail).toHaveBeenCalledTimes(0);
            expect(RefreshTokenManagerSpy.generate).toHaveBeenCalledTimes(0);
            expect(AccessTokenManagerSpy.generate).toHaveBeenCalledTimes(0);

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

    describe('confirm email address mutation', () => {

        const confirmEmailAddressMutation = `
            mutation ConfirmEmailAddress($token: String!) {
              confirmEmailAddress(token: $token)
            }
        `;

        describe('validation', () => {

            const send = useValidationUtils<EmailAddressConfirmationData>({
                testUtils,
                resolverSpy: jest.spyOn(RegisterResolver.prototype, 'confirmEmailAddress'),
                query: confirmEmailAddressMutation,
                validFormData: {
                    token: sign({}, 'shhh'),
                },
            });

            it('should be accessible for unauthenticated users', async () => {
                await send.withoutAuth().expectValidationSuccess();
            });

            it('should validate token', async () => {
                // should accept valid
                await send.withAuth({ token: sign({}, 'shhh') }).expectValidationSuccess();
                await send.withAuth({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJoZWxsbyJ9._' }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ token: '' }).expectValidationError('token');
                await send.withAuth({ token: 'invalid-token' }).expectValidationError('token');
            });

        });

        function createSampleEmailAddressConfirmationToken(userData: Pick<User, 'id'>) {
            return Container.get(EmailAddressConfirmationService).generateEmailAddressConfirmationToken(userData);
        }

        it('should mark user email as confirmed if token is valid', async () => {
            const user = await testUtils.db.populateWithUser({ isEmailAddressConfirmed: false });
            const emailAddressConfirmationData: EmailAddressConfirmationData = {
                token: createSampleEmailAddressConfirmationToken(user),
            };
            const response = await testUtils.postGraphQL({
                query: confirmEmailAddressMutation,
                variables: emailAddressConfirmationData,
            });

            // verify if token was verified
            expect(EmailAddressConfirmationTokenManagerSpy.verify).toHaveBeenCalledTimes(1);
            expect(EmailAddressConfirmationTokenManagerSpy.verify).toHaveBeenCalledWith(emailAddressConfirmationData.token);

            // verify if user was updated
            expect(UserRepositorySpy.persistAndFlush).toHaveBeenCalledTimes(1);
            expect(UserRepositorySpy.persistAndFlush).toHaveBeenCalledWith(expect.objectContaining({
                id: user.id,
                isEmailAddressConfirmed: true,
            }));

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    confirmEmailAddress: true,
                },
            });
        });

        it('should return error is email address is already confirmed', async () => {
            const user = await testUtils.db.populateWithUser({ isEmailAddressConfirmed: true });
            const emailAddressConfirmationData: EmailAddressConfirmationData = {
                token: createSampleEmailAddressConfirmationToken(user),
            };
            const response = await testUtils.postGraphQL({
                query: confirmEmailAddressMutation,
                variables: emailAddressConfirmationData,
            });

            // verify if token was verified
            expect(EmailAddressConfirmationTokenManagerSpy.verify).toHaveBeenCalledTimes(1);
            expect(EmailAddressConfirmationTokenManagerSpy.verify).toHaveBeenCalledWith(emailAddressConfirmationData.token);

            // verify if user was not updated
            expect(UserRepositorySpy.persistAndFlush).toHaveBeenCalledTimes(0);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access-error' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: null,
                errors: [
                    expect.objectContaining({
                        message: 'EMAIL_ADDRESS_ALREADY_CONFIRMED',
                    }),
                ],
            });
        });

        it('should return error if token is untrustworthy', async () => {
            const emailAddressConfirmationData: EmailAddressConfirmationData = {
                token: sign({ id: 'sample id' }, 'WRONG_PRIVATE_KEY'),
            };
            const response = await testUtils.postGraphQL({
                query: confirmEmailAddressMutation,
                variables: emailAddressConfirmationData,
            });

            // verify if the database was not queried
            expect(UserRepositorySpy.findOneOrFail).toHaveBeenCalledTimes(0);

            // verify if user was not updated
            expect(UserRepositorySpy.persistAndFlush).toHaveBeenCalledTimes(0);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access-error' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: null,
                errors: [
                    expect.objectContaining({
                        message: 'INVALID_EMAIL_ADDRESS_CONFIRMATION_TOKEN',
                    }),
                ],
            });
        });

    });

});
