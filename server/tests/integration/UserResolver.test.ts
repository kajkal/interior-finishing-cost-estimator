import { Container } from 'typedi';
import { sign } from 'jsonwebtoken';

import { MockLogger } from '../__mocks__/utils/logger';
import '../__mocks__/libraries/sendgrid';

import { UserRepositorySpiesManager } from '../__utils__/spies-managers/UserRepositorySpiesManager';
import { useIntegrationTestsUtils } from '../__utils__/integration-utils/useIntegrationTestsUtils';
import { TokenServiceSpiesManager } from '../__utils__/spies-managers/TokenServiceSpiesManager';
import { EmailServiceSpiesManager } from '../__utils__/spies-managers/EmailServiceSpiesManager';
import { AuthServiceSpiesManager } from '../__utils__/spies-managers/AuthServiceSpiesManager';
import { createAccessToken } from '../__utils__/integration-utils/authUtils';
import { generator } from '../__utils__/generator';

import { RegisterFormData } from '../../src/modules/user/input/RegisterFormData';
import { LoginFormData } from '../../src/modules/user/input/LoginFormData';
import { AccountService } from '../../src/services/AccountService';
import { User } from '../../src/entities/user/User';


describe('UserResolver', () => {

    const testUtils = useIntegrationTestsUtils();

    beforeEach(async () => {
        MockLogger.setupMocks();
        TokenServiceSpiesManager.setupSpies();
        UserRepositorySpiesManager.setupSpies();
        EmailServiceSpiesManager.setupSpiesAndMockImplementations();
        AuthServiceSpiesManager.setupSpies();
    });

    describe('me query', () => {

        const meQuery = `
            query Me {
              me {
                name
                email
                products {
                  name
                }
                projects {
                  name
                }
                offers {
                  name
                }
              }
            }
        `;

        it('should return data of the currently authenticated user if user is authenticated', async (done) => {
            const user = await testUtils.db.populateWithUser();
            const product1 = await testUtils.db.populateWithProduct(user.id);
            const product2 = await testUtils.db.populateWithProduct(user.id);
            const [ authHeader, validToken ] = createAccessToken(user);
            const response = await testUtils.postGraphQL({
                query: meQuery,
            }).set('Authorization', authHeader);

            // verify if access token was verified
            expect(TokenServiceSpiesManager.accessToken.verify).toHaveBeenCalledTimes(1);
            expect(TokenServiceSpiesManager.accessToken.verify).toHaveBeenCalledWith(validToken);

            // verify if the database was queried
            expect(UserRepositorySpiesManager.findOneOrFail).toHaveBeenCalledTimes(1);
            expect(UserRepositorySpiesManager.findOneOrFail).toHaveBeenCalledWith({ id: user.id });

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify query response
            expect(response.body).toEqual({
                data: {
                    me: {
                        name: user.name,
                        email: user.email,
                        products: [
                            { name: product1.name },
                            { name: product2.name },
                        ],
                        projects: [],
                        offers: [],
                    },
                },
            });
            done();
        });

        it('should return error if user is not authenticated', async (done) => {
            const response = await testUtils.postGraphQL({
                query: meQuery,
            }); // without Authorization header with access token

            // verify if access token was verified
            expect(TokenServiceSpiesManager.accessToken.verify).toHaveBeenCalledTimes(1);
            expect(TokenServiceSpiesManager.accessToken.verify).toHaveBeenCalledWith(undefined);

            // verify if the database was not queried
            expect(UserRepositorySpiesManager.findOneOrFail).toHaveBeenCalledTimes(0);

            // verify if access error was logged
            expect(MockLogger.warn).toHaveBeenCalledTimes(1);
            expect(MockLogger.warn).toHaveBeenCalledWith(expect.objectContaining({ message: 'invalid token' }));

            // verify query response
            expect(response.body).toEqual({
                data: null,
                errors: [
                    expect.objectContaining({
                        message: 'INVALID_ACCESS_TOKEN',
                    }),
                ],
            });
            done();
        });

    });

    describe('register mutation', () => {

        const registerMutation = `
            mutation Register($name: String!, $email: String!, $password: String!) {
              register(name: $name, email: $email, password: $password) {
                accessToken
                user {
                  name
                  email
                }
              }
            }
        `;

        it('should create new user and return initial data if form data are valid', async (done) => {
            const registerFormData: RegisterFormData = {
                name: generator.name(),
                email: generator.email(),
                password: generator.string({ length: 8 }),
            };
            const response = await testUtils.postGraphQL({
                query: registerMutation,
                variables: registerFormData,
            });

            // verify if email was check for availability
            expect(UserRepositorySpiesManager.isEmailTaken).toHaveBeenCalledTimes(1);
            expect(UserRepositorySpiesManager.isEmailTaken).toHaveBeenCalledWith(registerFormData.email);

            // verify if new user object was created and saved in db
            expect(UserRepositorySpiesManager.create).toHaveBeenCalledTimes(1);
            expect(UserRepositorySpiesManager.persistAndFlush).toHaveBeenCalledTimes(1);

            // verify if 'Confirm your email address' email was send
            expect(EmailServiceSpiesManager.sendConfirmEmailAddressEmail).toHaveBeenCalledTimes(1);
            expect(EmailServiceSpiesManager.sendConfirmEmailAddressEmail).toHaveBeenCalledWith(expect.objectContaining({
                name: registerFormData.name,
                email: registerFormData.email,
            }));

            // verify if refresh token was generated and added to cookie
            expect(TokenServiceSpiesManager.refreshToken.generate).toHaveBeenCalledTimes(1);
            expect(TokenServiceSpiesManager.refreshToken.generate).toHaveBeenCalledWith({ sub: expect.any(String) });
            expect(response.header[ 'set-cookie' ]).toEqual([
                expect.stringMatching(/^rt=.+; Path=\/refresh_token; Expires=.+; HttpOnly$/),
            ]);

            // verify if access token was generated
            expect(TokenServiceSpiesManager.accessToken.generate).toHaveBeenCalledTimes(1);
            expect(TokenServiceSpiesManager.accessToken.generate).toHaveBeenCalledWith({ sub: expect.any(String) });

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
                            email: registerFormData.email,
                        },
                    },
                },
            });
            done();
        });

        it('should return error if user with given email address already exists', async (done) => {
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

            // verify if email was check for availability
            expect(UserRepositorySpiesManager.isEmailTaken).toHaveBeenCalledTimes(1);
            expect(UserRepositorySpiesManager.isEmailTaken).toHaveBeenCalledWith(registerFormData.email);

            // verify if functions reserved for creating new user were not called
            expect(UserRepositorySpiesManager.create).toHaveBeenCalledTimes(0);
            expect(UserRepositorySpiesManager.persistAndFlush).toHaveBeenCalledTimes(0);
            expect(EmailServiceSpiesManager.sendConfirmEmailAddressEmail).toHaveBeenCalledTimes(0);
            expect(TokenServiceSpiesManager.refreshToken.generate).toHaveBeenCalledTimes(0);
            expect(TokenServiceSpiesManager.accessToken.generate).toHaveBeenCalledTimes(0);

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
            done();
        });

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

            // verify if refresh token was generated and added to cookie
            expect(TokenServiceSpiesManager.refreshToken.generate).toHaveBeenCalledTimes(1);
            expect(TokenServiceSpiesManager.refreshToken.generate).toHaveBeenCalledWith({ sub: existingUser.id });
            expect(response.header[ 'set-cookie' ]).toEqual([
                expect.stringMatching(/^rt=.+; Path=\/refresh_token; Expires=.+; HttpOnly$/),
            ]);

            // verify if access token was generated
            expect(TokenServiceSpiesManager.accessToken.generate).toHaveBeenCalledTimes(1);
            expect(TokenServiceSpiesManager.accessToken.generate).toHaveBeenCalledWith({ sub: existingUser.id });

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

            // verify if any token was not generated
            expect(TokenServiceSpiesManager.refreshToken.generate).toHaveBeenCalledTimes(0);
            expect(TokenServiceSpiesManager.accessToken.generate).toHaveBeenCalledTimes(0);
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
            expect(AuthServiceSpiesManager.invalidateRefreshToken).toHaveBeenCalledTimes(1);
            expect(response.header[ 'set-cookie' ]).toEqual([
                expect.stringMatching(/^rt=; Max-Age=0; Path=\/refresh_token; Expires=.+; HttpOnly$/),
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

    describe('confirm email address mutation', () => {

        const confirmEmailAddressMutation = `
            mutation ConfirmEmailAddress($token: String!) {
              confirmEmailAddress(token: $token)
            }
        `;

        function createSampleEmailAddressConfirmationToken(userData: Pick<User, 'id'>) {
            return Container.get(AccountService).generateEmailAddressConfirmationToken(userData);
        }

        it('should mark user email as confirmed if token is valid', async (done) => {
            const user = await testUtils.db.populateWithUser({ isEmailAddressConfirmed: false });
            const validToken = createSampleEmailAddressConfirmationToken(user);
            const response = await testUtils.postGraphQL({
                query: confirmEmailAddressMutation,
                variables: { token: validToken },
            });

            // verify if token was verified
            expect(TokenServiceSpiesManager.emailAddressConfirmationToken.verify).toHaveBeenCalledTimes(1);
            expect(TokenServiceSpiesManager.emailAddressConfirmationToken.verify).toHaveBeenCalledWith(validToken);

            // verify if the database was queried
            expect(UserRepositorySpiesManager.findOneOrFail).toHaveBeenCalledTimes(1);
            expect(UserRepositorySpiesManager.findOneOrFail).toHaveBeenCalledWith({ id: user.id });

            // verify if user was updated
            expect(UserRepositorySpiesManager.persistAndFlush).toHaveBeenCalledTimes(1);
            expect(user.isEmailAddressConfirmed).toBe(true);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    confirmEmailAddress: true,
                },
            });
            done();
        });

        it('should return error is email address is already confirmed', async (done) => {
            const user = await testUtils.db.populateWithUser({ isEmailAddressConfirmed: true });
            const validToken = createSampleEmailAddressConfirmationToken(user);
            const response = await testUtils.postGraphQL({
                query: confirmEmailAddressMutation,
                variables: { token: validToken },
            });

            // verify if token was verified
            expect(TokenServiceSpiesManager.emailAddressConfirmationToken.verify).toHaveBeenCalledTimes(1);
            expect(TokenServiceSpiesManager.emailAddressConfirmationToken.verify).toHaveBeenCalledWith(validToken);

            // verify if the database was queried
            expect(UserRepositorySpiesManager.findOneOrFail).toHaveBeenCalledTimes(1);
            expect(UserRepositorySpiesManager.findOneOrFail).toHaveBeenCalledWith({ id: user.id });

            // verify if user was not updated
            expect(UserRepositorySpiesManager.persistAndFlush).toHaveBeenCalledTimes(0);
            expect(user.isEmailAddressConfirmed).toBe(true);

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
            done();
        });

        it('should return error if token is invalid', async (done) => {
            const invalidToken = sign({ id: 'sample id' }, 'WRONG_PRIVATE_KEY');
            const response = await testUtils.postGraphQL({
                query: confirmEmailAddressMutation,
                variables: { token: invalidToken },
            });

            // verify if the database was not queried
            expect(UserRepositorySpiesManager.findOneOrFail).toHaveBeenCalledTimes(0);

            // verify if user was not updated
            expect(UserRepositorySpiesManager.persistAndFlush).toHaveBeenCalledTimes(0);

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
            done();
        });

    });

});
