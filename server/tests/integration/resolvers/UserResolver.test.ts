import { MockLogger } from '../../__mocks__/utils/logger';

import { useIntegrationTestsUtils } from '../../__utils__/integration-utils/useIntegrationTestsUtils';
import { UserRepositorySpy } from '../../__utils__/spies/repositories/UserRepositorySpy';
import { AccessTokenManagerSpy } from '../../__utils__/spies/services/auth/AccessTokenManagerSpy';
import { createAccessToken } from '../../__utils__/integration-utils/authUtils';


describe('UserResolver', () => {

    const testUtils = useIntegrationTestsUtils();

    beforeEach(async () => {
        MockLogger.setupMocks();

        // repositories
        UserRepositorySpy.setupSpies();

        // token managers
        AccessTokenManagerSpy.setupSpies();
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
            expect(AccessTokenManagerSpy.verify).toHaveBeenCalledTimes(1);
            expect(AccessTokenManagerSpy.verify).toHaveBeenCalledWith(validToken);

            // verify if the database was queried
            expect(UserRepositorySpy.findOneOrFail).toHaveBeenCalledTimes(1);
            expect(UserRepositorySpy.findOneOrFail).toHaveBeenCalledWith({ id: user.id });

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
            expect(AccessTokenManagerSpy.verify).toHaveBeenCalledTimes(1);
            expect(AccessTokenManagerSpy.verify).toHaveBeenCalledWith(undefined);

            // verify if the database was not queried
            expect(UserRepositorySpy.findOneOrFail).toHaveBeenCalledTimes(0);

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

});
