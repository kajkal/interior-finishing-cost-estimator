import { hash } from 'argon2';
import { Container } from 'typedi';
import { ConnectionManager } from 'typeorm';

import { MockConnectionManager } from '../../../__mocks__/repositories/ConnectionManager';
import { MockUserRepository } from '../../../__mocks__/repositories/MockUserRepository';
import { GraphQLLoggerMockManager } from '../../../__mocks__/utils/LoggerMockManager';
import { MockJwtService } from '../../../__mocks__/services/MockJwtService';

import { executeGraphQLOperation } from '../../../test-utils/executeGraphQLOperation';
import { RegisterFormData } from '../../../../src/modules/user/input/RegisterFormData';
import { LoginFormData } from '../../../../src/modules/user/input/LoginFormData';
import { UserRepository } from '../../../../src/repositories/UserRepository';
import { JwtService } from '../../../../src/services/JwtService';
import { User } from '../../../../src/entities/User';


describe('UserResolver class', () => {

    beforeAll(() => {
        Container.set(UserRepository, MockUserRepository);
        Container.set(JwtService, MockJwtService);
        Container.set(ConnectionManager, MockConnectionManager);
    });

    beforeEach(() => {
        GraphQLLoggerMockManager.setupMocks();
        MockUserRepository.setupMocks();
        MockJwtService.setupSpies();
    });

    describe('register', () => {

        const registerMutation = `
            mutation Register($data: RegisterFormData!) {
              register(data: $data) {
                projects
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

            // verify if access was logged
            expect(GraphQLLoggerMockManager.info).toHaveBeenCalledTimes(1);
            expect(GraphQLLoggerMockManager.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify if email was check for availability
            expect(MockUserRepository.isEmailTaken).toHaveBeenCalledTimes(1);
            expect(MockUserRepository.isEmailTaken).toHaveBeenCalledWith(registerFormData.email);

            // verify if new user object was created and saved in db
            expect(MockUserRepository.create).toHaveBeenCalledTimes(1);
            expect(MockUserRepository.save).toHaveBeenCalledTimes(1);

            // verify if JWT is generated and added to cookie
            expect(MockJwtService.generate).toHaveBeenCalledTimes(1);
            expect(MockJwtService.generate).toHaveBeenCalledWith(expect.any(Object), {
                name: 'John Smith',
                email: 'john.smith@domain.com',
                password: expect.any(String),
                createdAt: expect.any(String),
                id: 'TEST_ID_FOR_john.smith@domain.com',
            });
            expect(mockCookieSetter).toHaveBeenCalledTimes(1);
            expect(mockCookieSetter).toHaveBeenCalledWith('jwt', expect.any(String), expect.any(Object));

            // verify if mutation response is correct
            expect(response).toEqual({
                data: {
                    register: {
                        projects: [],
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
            expect(MockUserRepository.save).toHaveBeenCalledTimes(0);
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

    describe('login', () => {

        const loginMutation = `
            mutation Login($data: LoginFormData!) {
              login(data: $data) {
                projects
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

            // verify if access was logged
            expect(GraphQLLoggerMockManager.info).toHaveBeenCalledTimes(1);
            expect(GraphQLLoggerMockManager.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify if JWT is generated and added to cookie
            expect(MockJwtService.generate).toHaveBeenCalledTimes(1);
            expect(MockJwtService.generate).toHaveBeenCalledWith(expect.any(Object), userObjectFromDb);
            expect(mockCookieSetter).toHaveBeenCalledTimes(1);
            expect(mockCookieSetter).toHaveBeenCalledWith('jwt', expect.any(String), expect.any(Object));

            // verify if mutation response is correct
            expect(response).toEqual({
                data: {
                    login: {
                        projects: [],
                    },
                },
            });
        });

        it('should return error if there is no user with given email in db', async () => {
            expect.assertions(4);

            const loginFormData = { ...basicLoginFormData };

            // mock check if email is in db
            MockUserRepository.findOne.mockResolvedValue(undefined);

            const response = await executeGraphQLOperation({
                source: loginMutation,
                variableValues: {
                    data: loginFormData,
                },
            });

            // verify if access was logged
            expect(GraphQLLoggerMockManager.info).toHaveBeenCalledTimes(1);
            expect(GraphQLLoggerMockManager.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access-error' }));

            // verify if functions reserved for valid user credentials are not called
            expect(MockJwtService.generate).toHaveBeenCalledTimes(0);

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

            // verify if access was logged
            expect(GraphQLLoggerMockManager.info).toHaveBeenCalledTimes(1);
            expect(GraphQLLoggerMockManager.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access-error' }));

            // verify if functions reserved for valid user credentials are not called
            expect(MockJwtService.generate).toHaveBeenCalledTimes(0);

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

    describe('logout', () => {

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

            // verify if access was logged
            expect(GraphQLLoggerMockManager.info).toHaveBeenCalledTimes(1);
            expect(GraphQLLoggerMockManager.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify if JWT is invalidated
            expect(MockJwtService.invalidate).toHaveBeenCalledTimes(1);

            // verify if mutation response is correct
            expect(response).toEqual({
                data: {
                    logout: true,
                },
            });
        });

    });

});
