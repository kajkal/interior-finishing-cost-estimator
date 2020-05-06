import { hash } from 'argon2';
import { Container } from 'typedi';

import { MockUserRepository } from '../../../__mocks__/repositories/MockUserRepository';
import { GraphQLLoggerMockManager } from '../../../__mocks__/utils/LoggerMockManager';
import { MockJwtService } from '../../../__mocks__/services/MockJwtService';

import { executeGraphQLOperation } from '../../../test-utils/executeGraphQLOperation';
import { RegisterFormData } from '../../../../src/modules/user/input/RegisterFormData';
import { LoginFormData } from '../../../../src/modules/user/input/LoginFormData';
import { JwtService } from '../../../../src/services/JwtService';
import { User } from '../../../../src/entities/user/User';
import { UserRepository } from '../../../../src/repositories/UserRepository';
import { RequestContextUtils } from '../../../test-utils/RequestContextUtils';


describe('UserResolver class', () => {

    beforeAll(() => {
        Container.set(UserRepository, MockUserRepository);
        Container.set(JwtService, MockJwtService);
    });

    beforeEach(() => {
        GraphQLLoggerMockManager.setupMocks();
        MockUserRepository.setupMocks();
        MockJwtService.setupSpies();
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
            expect.assertions(10);

            // mock user from db
            const mockLoadProductItems = jest.fn().mockResolvedValue([]);
            const mockLoadProjectItems = jest.fn().mockResolvedValue([]);
            const mockLoadOfferItems = jest.fn().mockResolvedValue([]);
            const userObjectFromDb = Object.assign(new User(), {
                id: 'TEST_ID_VALUE',
                name: 'John Smith',
                email: 'john.smith@domain.com',
                products: { loadItems: mockLoadProductItems },
                projects: { loadItems: mockLoadProjectItems },
                offers: { loadItems: mockLoadOfferItems },
            });
            MockUserRepository.findOneOrFail.mockResolvedValue(userObjectFromDb as User);

            const requestContext = RequestContextUtils.createWithValidCookie(userObjectFromDb);
            const response = await executeGraphQLOperation({
                source: meQuery,
                contextValue: requestContext,
            });

            // verify if JWT cookie was verified
            expect(MockJwtService.verify).toHaveBeenCalledTimes(1);
            expect(MockJwtService.verify).toHaveBeenCalledWith(requestContext);

            // verify if the database was queried
            expect(MockUserRepository.findOneOrFail).toHaveBeenCalledTimes(1);
            expect(MockUserRepository.findOneOrFail).toHaveBeenCalledWith({ id: 'TEST_ID_VALUE' });

            // verify if field resolvers was called
            expect(mockLoadProductItems).toHaveBeenCalledTimes(1);
            expect(mockLoadProjectItems).toHaveBeenCalledTimes(1);
            expect(mockLoadOfferItems).toHaveBeenCalledTimes(1);

            // verify if access was logged
            expect(GraphQLLoggerMockManager.info).toHaveBeenCalledTimes(1);
            expect(GraphQLLoggerMockManager.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify if query response is correct
            expect(response).toEqual({
                data: {
                    me: {
                        name: 'John Smith',
                        email: 'john.smith@domain.com',
                        products: [],
                        projects: [],
                        offers: [],
                    },
                },
            });
        });

        it('should return error if user is not authenticated', async () => {
            expect.assertions(6);

            const requestContext = RequestContextUtils.createWithInvalidCookie();
            const response = await executeGraphQLOperation({
                source: meQuery,
                contextValue: requestContext,
            });

            // verify if JWT cookie was verified
            expect(MockJwtService.verify).toHaveBeenCalledTimes(1);
            expect(MockJwtService.verify).toHaveBeenCalledWith(requestContext);

            // verify if functions reserved for authenticated users were not called
            expect(MockUserRepository.findOneOrFail).toHaveBeenCalledTimes(0);

            // verify if access error was logged
            expect(GraphQLLoggerMockManager.warn).toHaveBeenCalledTimes(1);
            expect(GraphQLLoggerMockManager.warn).toHaveBeenCalledWith(expect.objectContaining({ message: 'invalid token' }));

            // verify if query response is correct
            expect(response).toEqual({
                data: null,
                errors: [
                    expect.objectContaining({
                        message: 'INVALID_TOKEN',
                    }),
                ],
            });
        });

    });

    describe('register mutation', () => {

        const registerMutation = `
            mutation Register($data: RegisterFormData!) {
              register(data: $data) {
                name
                email
              }
            }
        `;

        const basicRegisterFormData: RegisterFormData = {
            name: 'John Smith',
            email: 'john.smith@domain.com',
            password: 'qwer.1234',
        };

        it('should create new user and return initial data if form data are valid', async () => {
            expect.assertions(11);

            MockUserRepository.isEmailTaken.mockResolvedValue(false);

            const mockCookieSetter = jest.fn();
            const registerFormData = { ...basicRegisterFormData };
            const response = await executeGraphQLOperation({
                source: registerMutation,
                variableValues: {
                    data: registerFormData,
                },
                contextValue: { res: { cookie: mockCookieSetter } },
            });

            // verify if email was check for availability
            expect(MockUserRepository.isEmailTaken).toHaveBeenCalledTimes(1);
            expect(MockUserRepository.isEmailTaken).toHaveBeenCalledWith(registerFormData.email);

            // verify if new user object was created and saved in db
            expect(MockUserRepository.create).toHaveBeenCalledTimes(1);
            expect(MockUserRepository.persistAndFlush).toHaveBeenCalledTimes(1);

            // verify if JWT is generated and added to cookie
            expect(MockJwtService.generate).toHaveBeenCalledTimes(1);
            expect(MockJwtService.generate).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({
                name: 'John Smith',
                email: 'john.smith@domain.com',
                password: expect.any(String),
                createdAt: expect.any(Date),
                id: 'TEST_ID_FOR_john.smith@domain.com',
            }));
            expect(mockCookieSetter).toHaveBeenCalledTimes(1);
            expect(mockCookieSetter).toHaveBeenCalledWith('jwt', expect.any(String), expect.any(Object));

            // verify if access was logged
            expect(GraphQLLoggerMockManager.info).toHaveBeenCalledTimes(1);
            expect(GraphQLLoggerMockManager.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify if mutation response is correct
            expect(response).toEqual({
                data: {
                    register: {
                        name: 'John Smith',
                        email: 'john.smith@domain.com',
                    },
                },
            });
        });

        it('should return error if user with given email address already exists', async () => {
            expect.assertions(8);

            MockUserRepository.isEmailTaken.mockResolvedValue(true);

            const registerFormData = { ...basicRegisterFormData };
            const response = await executeGraphQLOperation({
                source: registerMutation,
                variableValues: {
                    data: registerFormData,
                },
            });

            // verify if access was logged
            expect(GraphQLLoggerMockManager.info).toHaveBeenCalledTimes(1);
            expect(GraphQLLoggerMockManager.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access-error' }));

            // verify if email was check for availability
            expect(MockUserRepository.isEmailTaken).toHaveBeenCalledTimes(1);
            expect(MockUserRepository.isEmailTaken).toHaveBeenCalledWith(registerFormData.email);

            // verify if functions reserved for valid user data are not called
            expect(MockUserRepository.create).toHaveBeenCalledTimes(0);
            expect(MockUserRepository.persistAndFlush).toHaveBeenCalledTimes(0);
            expect(MockJwtService.generate).toHaveBeenCalledTimes(0);

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
                email
              }
            }
        `;

        const basicLoginFormData: LoginFormData = {
            email: 'john.smith@domain.com',
            password: 'qwer.1234',
        };

        it('should login user and return initial data if form data are valid', async () => {
            expect.assertions(7);

            const loginFormData = { ...basicLoginFormData };
            const mockCookieSetter = jest.fn();

            // mock check if email is in db
            const userObjectFromDb = {
                ...loginFormData,
                password: await hash(loginFormData.password), // hashed password
            };
            MockUserRepository.findOne.mockResolvedValue(userObjectFromDb as User);

            const response = await executeGraphQLOperation({
                source: loginMutation,
                variableValues: {
                    data: loginFormData,
                },
                contextValue: { res: { cookie: mockCookieSetter } },
            });

            // verify if JWT is generated and added to cookie
            expect(MockJwtService.generate).toHaveBeenCalledTimes(1);
            expect(MockJwtService.generate).toHaveBeenCalledWith(expect.any(Object), userObjectFromDb);
            expect(mockCookieSetter).toHaveBeenCalledTimes(1);
            expect(mockCookieSetter).toHaveBeenCalledWith('jwt', expect.any(String), expect.any(Object));

            // verify if access was logged
            expect(GraphQLLoggerMockManager.info).toHaveBeenCalledTimes(1);
            expect(GraphQLLoggerMockManager.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify if mutation response is correct
            expect(response).toEqual({
                data: {
                    login: {
                        email: 'john.smith@domain.com',
                    },
                },
            });
        });

        it('should return error if there is no user with given email in db', async () => {
            expect.assertions(4);

            const loginFormData = { ...basicLoginFormData };

            // mock check if email is in db
            MockUserRepository.findOne.mockResolvedValue(null);

            const response = await executeGraphQLOperation({
                source: loginMutation,
                variableValues: {
                    data: loginFormData,
                },
            });

            // verify if functions reserved for valid user credentials are not called
            expect(MockJwtService.generate).toHaveBeenCalledTimes(0);

            // verify if access was logged
            expect(GraphQLLoggerMockManager.info).toHaveBeenCalledTimes(1);
            expect(GraphQLLoggerMockManager.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access-error' }));

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

        it('should return error if provided password is incorrect', async () => {
            expect.assertions(4);

            const loginFormData = { ...basicLoginFormData };

            // mock check if email is in db
            const userObjectFromDb = {
                ...loginFormData,
                password: await hash('other password'), // hashed password
            };
            MockUserRepository.findOne.mockResolvedValue(userObjectFromDb as User);

            const response = await executeGraphQLOperation({
                source: loginMutation,
                variableValues: {
                    data: loginFormData,
                },
            });

            // verify if functions reserved for valid user credentials are not called
            expect(MockJwtService.generate).toHaveBeenCalledTimes(0);

            // verify if access was logged
            expect(GraphQLLoggerMockManager.info).toHaveBeenCalledTimes(1);
            expect(GraphQLLoggerMockManager.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access-error' }));

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
            expect(MockJwtService.invalidate).toHaveBeenCalledTimes(1);

            // verify if access was logged
            expect(GraphQLLoggerMockManager.info).toHaveBeenCalledTimes(1);
            expect(GraphQLLoggerMockManager.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify if mutation response is correct
            expect(response).toEqual({
                data: {
                    logout: true,
                },
            });
        });

    });

});
