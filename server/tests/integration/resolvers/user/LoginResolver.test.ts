import { MockLogger } from '../../../__mocks__/utils/logger';

import { useIntegrationTestsUtils } from '../../../__utils__/integration-utils/useIntegrationTestsUtils';
import { UserRepositorySpy } from '../../../__utils__/spies/repositories/UserRepositorySpy';
import { AuthServiceSpy } from '../../../__utils__/spies/services/auth/AuthServiceSpy';
import { AccessTokenManagerSpy } from '../../../__utils__/spies/services/auth/AccessTokenManagerSpy';
import { RefreshTokenManagerSpy } from '../../../__utils__/spies/services/auth/RefreshTokenManagerSpy';

import { LoginFormData } from '../../../../src/resolvers/user/input/LoginFormData';


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

        it('should login user and return initial data if credentials are correct', async (done) => {
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
            done();
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

        it('should return error if provided password is incorrect', async (done) => {
            const existingUser = await testUtils.db.populateWithUser();
            await expectBadCredentialsError({
                email: existingUser.email,
                password: 'wrong password',
            });
            done();
        });

        it('should return error if there is no registered user with provided email', async (done) => {
            await expectBadCredentialsError({
                email: 'not.registered@domain.com',
                password: 'Secure password',
            });
            done();
        });

    });

    describe('logout mutation', () => {

        const logoutMutation = `
            mutation Logout {
              logout
            }
        `;

        it('should invalidate refresh token cookie', async (done) => {
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
            done();
        });

    });

});
