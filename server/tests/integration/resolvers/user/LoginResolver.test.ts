import { MockLogger } from '../../../__mocks__/utils/logger';

import { useIntegrationTestsUtils } from '../../../__utils__/integration-utils/useIntegrationTestsUtils';
import { RefreshTokenManagerSpy } from '../../../__utils__/spies/services/auth/RefreshTokenManagerSpy';
import { AccessTokenManagerSpy } from '../../../__utils__/spies/services/auth/AccessTokenManagerSpy';
import { useValidationUtils } from '../../../__utils__/integration-utils/useValidationUtils';
import { UserRepositorySpy } from '../../../__utils__/spies/repositories/UserRepositorySpy';
import { AuthServiceSpy } from '../../../__utils__/spies/services/auth/AuthServiceSpy';

import { LoginFormData } from '../../../../src/resolvers/user/input/LoginFormData';
import { LoginResolver } from '../../../../src/resolvers/user/LoginResolver';


describe('LoginResolver', () => {

    const testUtils = useIntegrationTestsUtils();

    beforeEach(async () => {
        MockLogger.setupMocks();

        // repositories
        UserRepositorySpy.setupSpies();

        // token managers
        AccessTokenManagerSpy.setupSpies();
        RefreshTokenManagerSpy.setupSpies();

        // services
        AuthServiceSpy.setupSpies();
    });

    describe('login mutation', () => {

        const loginMutation = `
            mutation Login($email: String!, $password: String!) {
              login(email: $email, password: $password) {
                accessToken
                user {
                  name
                  email
                }
              }
            }
        `;

        describe('validation', () => {

            const send = useValidationUtils<LoginFormData>({
                testUtils,
                resolverSpy: jest.spyOn(LoginResolver.prototype, 'login'),
                query: loginMutation,
                validFormData: {
                    email: 'valid.email@domain.com',
                    password: 'Secure password',
                },
            });

            it('should be accessible for unauthenticated users', async () => {
                await send.withoutAuth().expectValidationSuccess();
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

        it('should login user and return initial data if credentials are correct', async () => {
            const existingUser = await testUtils.db.populateWithUser();
            const response = await testUtils.postGraphQL({
                query: loginMutation,
                variables: {
                    email: existingUser.email,
                    password: existingUser.unencryptedPassword,
                },
            });

            // verify if the database was queried
            expect(UserRepositorySpy.findOne).toHaveBeenCalledTimes(1);
            expect(UserRepositorySpy.findOne).toHaveBeenCalledWith({ email: existingUser.email });

            // verify if refresh token was generated and added to cookie
            expect(RefreshTokenManagerSpy.generate).toHaveBeenCalledTimes(1);
            expect(RefreshTokenManagerSpy.generate).toHaveBeenCalledWith({ sub: existingUser.id });
            expect(response.header[ 'set-cookie' ]).toEqual([
                expect.stringMatching(/^rt=.+; Path=\/refresh_token; Expires=.+; HttpOnly; SameSite=Strict$/),
            ]);

            // verify if access token was generated
            expect(AccessTokenManagerSpy.generate).toHaveBeenCalledTimes(1);
            expect(AccessTokenManagerSpy.generate).toHaveBeenCalledWith({ sub: existingUser.id });

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    login: {
                        accessToken: expect.any(String),
                        user: {
                            name: existingUser.name,
                            email: existingUser.email,
                        },
                    },
                },
            });
        });

        async function expectBadCredentialsError(loginFormData: LoginFormData) {
            const response = await testUtils.postGraphQL({
                query: loginMutation,
                variables: loginFormData,
            });

            // verify if the database was queried
            expect(UserRepositorySpy.findOne).toHaveBeenCalledTimes(1);

            // verify if any token was not generated
            expect(RefreshTokenManagerSpy.generate).toHaveBeenCalledTimes(0);
            expect(AccessTokenManagerSpy.generate).toHaveBeenCalledTimes(0);
            expect(response.header[ 'set-cookie' ]).toBe(undefined);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access-error' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: null,
                errors: [
                    expect.objectContaining({
                        message: 'BAD_CREDENTIALS',
                    }),
                ],
            });
        }

        it('should return error if provided password is incorrect', async () => {
            const existingUser = await testUtils.db.populateWithUser();
            await expectBadCredentialsError({
                email: existingUser.email,
                password: 'wrong password',
            });
        });

        it('should return error if there is no registered user with provided email', async () => {
            await expectBadCredentialsError({
                email: 'not.registered@domain.com',
                password: 'Secure password',
            });
        });

    });

    describe('logout mutation', () => {

        const logoutMutation = `
            mutation Logout {
              logout
            }
        `;

        describe('validation', () => {

            const send = useValidationUtils<undefined>({
                testUtils,
                resolverSpy: jest.spyOn(LoginResolver.prototype, 'logout'),
                query: logoutMutation,
                validFormData: undefined,
            });

            it('should be accessible for unauthenticated users', async () => {
                await send.withoutAuth().expectValidationSuccess();
            });

        });

        it('should invalidate refresh token cookie', async () => {
            const response = await testUtils.postGraphQL({
                query: logoutMutation,
            });

            // verify if refresh token was invalidated
            expect(AuthServiceSpy.invalidateRefreshToken).toHaveBeenCalledTimes(1);
            expect(response.header[ 'set-cookie' ]).toEqual([
                expect.stringMatching(/^rt=; Max-Age=0; Path=\/refresh_token; Expires=.+; HttpOnly; SameSite=Strict$/),
            ]);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    logout: true,
                },
            });
        });

    });

});
