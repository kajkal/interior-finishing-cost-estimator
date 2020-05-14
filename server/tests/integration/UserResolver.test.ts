import { MockLogger } from '../__mocks__/utils/logger';

import { UserRepositorySpiesManager } from '../__utils__/spies-managers/UserRepositorySpiesManager';
import { AuthServiceSpiesManager } from '../__utils__/spies-managers/AuthServiceSpiesManager';
import { executeGraphQLOperation } from '../__utils__/integration-utils/executeGraphQLOperation';
import { TestDatabaseManager } from '../__utils__/integration-utils/TestDatabaseManager';
import { RequestContextUtils } from '../__utils__/integration-utils/RequestContextUtils';
import { generator } from '../__utils__/generator';

import { RegisterFormData } from '../../src/modules/user/input/RegisterFormData';
import { LoginFormData } from '../../src/modules/user/input/LoginFormData';
import { Product } from '../../src/entities/product/Product';
import { User } from '../../src/entities/user/User';


describe('UserResolver class', () => {

    const correctPassword = 'qwer.1234';

    let existingUser: User;
    let existingProduct: Product;

    beforeAll(async () => {
        await TestDatabaseManager.connect();
        existingUser = await TestDatabaseManager.populateWithUser({
            name: generator.name(),
            email: generator.email(),
            password: correctPassword,
        });
        existingProduct = await TestDatabaseManager.populateWithProduct({
            user: existingUser.id,
            name: 'Lamp',
        });
    });

    afterAll(async () => {
        await TestDatabaseManager.disconnect();
    });

    beforeEach(() => {
        UserRepositorySpiesManager.setupSpies();
        AuthServiceSpiesManager.setupSpies();
        MockLogger.setupMocks();
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

        it('should return data of the currently authenticated user if user is authenticated', async () => {
            expect.assertions(7);

            const requestContext = RequestContextUtils.createWithValidAccessToken(existingUser);
            const response = await executeGraphQLOperation({
                source: meQuery,
                contextValue: requestContext,
            });

            // verify if access token was verified
            expect(AuthServiceSpiesManager.verifyAccessToken).toHaveBeenCalledTimes(1);
            expect(AuthServiceSpiesManager.verifyAccessToken).toHaveBeenCalledWith(requestContext.req);

            // verify if the database was queried
            expect(UserRepositorySpiesManager.findOneOrFail).toHaveBeenCalledTimes(1);
            expect(UserRepositorySpiesManager.findOneOrFail).toHaveBeenCalledWith({ id: existingUser.id });

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify if query response is correct
            expect(response).toEqual({
                data: {
                    me: {
                        name: existingUser.name,
                        email: existingUser.email,
                        products: [
                            { name: existingProduct.name },
                        ],
                        projects: [],
                        offers: [],
                    },
                },
            });
        });

        it('should return error if user is not authenticated', async () => {
            expect.assertions(6);

            const requestContext = RequestContextUtils.createWithInvalidAccessToken();
            const response = await executeGraphQLOperation({
                source: meQuery,
                contextValue: requestContext,
            });

            // verify if access token was verified
            expect(AuthServiceSpiesManager.verifyAccessToken).toHaveBeenCalledTimes(1);
            expect(AuthServiceSpiesManager.verifyAccessToken).toHaveBeenCalledWith(requestContext.req);

            // verify if functions reserved for authenticated users are not called
            expect(UserRepositorySpiesManager.findOneOrFail).toHaveBeenCalledTimes(0);

            // verify if access error was logged
            expect(MockLogger.warn).toHaveBeenCalledTimes(1);
            expect(MockLogger.warn).toHaveBeenCalledWith(expect.objectContaining({ message: 'invalid token' }));

            // verify if query response is correct
            expect(response).toEqual({
                data: null,
                errors: [
                    expect.objectContaining({
                        message: 'INVALID_ACCESS_TOKEN',
                    }),
                ],
            });
        });

    });

    describe('register mutation', () => {

        const registerMutation = `
            mutation Register($data: RegisterFormData!) {
              register(data: $data) {
                accessToken
                user {
                  name
                  email
                }
              }
            }
        `;

        it('should create new user and return initial data if form data are valid', async () => {
            expect.assertions(13);

            const mockCookieSetter = jest.fn();
            const registerFormData: RegisterFormData = {
                name: generator.name(),
                email: generator.email(),
                password: generator.string({ length: 8 }),
            };
            const response = await executeGraphQLOperation({
                source: registerMutation,
                variableValues: {
                    data: registerFormData,
                },
                contextValue: { res: { cookie: mockCookieSetter } },
            });

            // verify if email was check for availability
            expect(UserRepositorySpiesManager.isEmailTaken).toHaveBeenCalledTimes(1);
            expect(UserRepositorySpiesManager.isEmailTaken).toHaveBeenCalledWith(registerFormData.email);

            // verify if new user object was created and saved in db
            expect(UserRepositorySpiesManager.create).toHaveBeenCalledTimes(1);
            expect(UserRepositorySpiesManager.persistAndFlush).toHaveBeenCalledTimes(1);

            // verify if refresh token is generated and added to cookie
            expect(AuthServiceSpiesManager.generateRefreshToken).toHaveBeenCalledTimes(1);
            expect(AuthServiceSpiesManager.generateRefreshToken).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({
                name: registerFormData.name,
                email: registerFormData.email,
                password: expect.any(String),
                createdAt: expect.any(Date),
                id: expect.any(String),
            }));
            expect(mockCookieSetter).toHaveBeenCalledTimes(1);
            expect(mockCookieSetter).toHaveBeenCalledWith('rt', expect.any(String), expect.any(Object));

            // verify if access token is generated
            expect(AuthServiceSpiesManager.generateAccessToken).toHaveBeenCalledTimes(1);
            expect(AuthServiceSpiesManager.generateAccessToken).toHaveBeenCalledWith(expect.any(User));

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify if mutation response is correct
            expect(response).toEqual({
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
        });

        it('should return error if user with given email address already exists', async () => {
            expect.assertions(9);

            const registerFormData: RegisterFormData = {
                name: generator.name(),
                email: existingUser.email,
                password: generator.string({ length: 8 }),
            };
            const response = await executeGraphQLOperation({
                source: registerMutation,
                variableValues: {
                    data: registerFormData,
                },
            });

            // verify if email was check for availability
            expect(UserRepositorySpiesManager.isEmailTaken).toHaveBeenCalledTimes(1);
            expect(UserRepositorySpiesManager.isEmailTaken).toHaveBeenCalledWith(registerFormData.email);

            // verify if functions reserved for valid user data are not called
            expect(UserRepositorySpiesManager.create).toHaveBeenCalledTimes(0);
            expect(UserRepositorySpiesManager.persistAndFlush).toHaveBeenCalledTimes(0);
            expect(AuthServiceSpiesManager.generateRefreshToken).toHaveBeenCalledTimes(0);
            expect(AuthServiceSpiesManager.generateAccessToken).toHaveBeenCalledTimes(0);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access-error' }));

            // verify if mutation response is correct
            expect(response).toEqual({
                data: null,
                errors: [
                    expect.objectContaining({
                        message: 'EMAIL_NOT_AVAILABLE',
                    }),
                ],
            });
        });

    });

    describe('login mutation', () => {

        const loginMutation = `
            mutation Login($data: LoginFormData!) {
              login(data: $data) {
                accessToken
                user {
                  name
                  email
                }
              }
            }
        `;

        it('should login user and return initial data if credentials are correct', async () => {
            expect.assertions(9);

            const mockCookieSetter = jest.fn();
            const loginFormData: LoginFormData = {
                email: existingUser.email,
                password: correctPassword,
            };
            const response = await executeGraphQLOperation({
                source: loginMutation,
                variableValues: {
                    data: loginFormData,
                },
                contextValue: { res: { cookie: mockCookieSetter } },
            });

            // verify if refresh token is generated and added to cookie
            expect(AuthServiceSpiesManager.generateRefreshToken).toHaveBeenCalledTimes(1);
            expect(AuthServiceSpiesManager.generateRefreshToken).toHaveBeenCalledWith(expect.any(Object), existingUser);
            expect(mockCookieSetter).toHaveBeenCalledTimes(1);
            expect(mockCookieSetter).toHaveBeenCalledWith('rt', expect.any(String), expect.any(Object));

            // verify if access token is generated
            expect(AuthServiceSpiesManager.generateAccessToken).toHaveBeenCalledTimes(1);
            expect(AuthServiceSpiesManager.generateAccessToken).toHaveBeenCalledWith(existingUser);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify if mutation response is correct
            expect(response).toEqual({
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

        it('should return error if provided password is incorrect', async () => {
            expect.assertions(6);

            const mockCookieSetter = jest.fn();
            const loginFormData: LoginFormData = {
                email: existingUser.email,
                password: 'wrong password',
            };
            const response = await executeGraphQLOperation({
                source: loginMutation,
                variableValues: {
                    data: loginFormData,
                },
                contextValue: { res: { cookie: mockCookieSetter } },
            });

            // verify if functions reserved for valid credentials are not called
            expect(AuthServiceSpiesManager.generateRefreshToken).toHaveBeenCalledTimes(0);
            expect(AuthServiceSpiesManager.generateAccessToken).toHaveBeenCalledTimes(0);
            expect(mockCookieSetter).toHaveBeenCalledTimes(0);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access-error' }));

            // verify if mutation response is correct
            expect(response).toEqual({
                data: null,
                errors: [
                    expect.objectContaining({
                        message: 'BAD_CREDENTIALS',
                    }),
                ],
            });
        });

        it('should return error if there is no registered user with given email', async () => {
            expect.assertions(6);

            const mockCookieSetter = jest.fn();
            const loginFormData: LoginFormData = {
                email: 'not.registered@domain.com',
                password: correctPassword,
            };
            const response = await executeGraphQLOperation({
                source: loginMutation,
                variableValues: {
                    data: loginFormData,
                },
                contextValue: { res: { cookie: mockCookieSetter } },
            });

            // verify if functions reserved for valid credentials are not called
            expect(AuthServiceSpiesManager.generateRefreshToken).toHaveBeenCalledTimes(0);
            expect(AuthServiceSpiesManager.generateAccessToken).toHaveBeenCalledTimes(0);
            expect(mockCookieSetter).toHaveBeenCalledTimes(0);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access-error' }));

            // verify if mutation response is correct
            expect(response).toEqual({
                data: null,
                errors: [
                    expect.objectContaining({
                        message: 'BAD_CREDENTIALS',
                    }),
                ],
            });
        });

    });

    describe('logout mutation', () => {

        const logoutMutation = `
            mutation Logout {
              logout
            }
        `;

        it('should invalidate user\' JWT', async () => {
            expect.assertions(4);

            const mockCookieSetter = jest.fn();
            const response = await executeGraphQLOperation({
                source: logoutMutation,
                contextValue: { res: { cookie: mockCookieSetter } },
            });

            // verify if JWT is invalidated
            expect(AuthServiceSpiesManager.invalidateRefreshToken).toHaveBeenCalledTimes(1);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify if mutation response is correct
            expect(response).toEqual({
                data: {
                    logout: true,
                },
            });
        });

    });

});
