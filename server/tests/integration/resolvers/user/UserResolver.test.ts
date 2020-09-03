import { MockLogger } from '../../../__mocks__/utils/logger';

import { useIntegrationTestsUtils } from '../../../__utils__/integration-utils/useIntegrationTestsUtils';
import { AccessTokenManagerSpy } from '../../../__utils__/spies/services/auth/AccessTokenManagerSpy';
import { StorageServiceSpy } from '../../../__utils__/spies/services/storage/StorageServiceSpy';
import { UserRepositorySpy } from '../../../__utils__/spies/repositories/UserRepositorySpy';
import { createAccessToken, getAuthHeader } from '../../../__utils__/integration-utils/authUtils';
import { useValidationUtils } from '../../../__utils__/integration-utils/useValidationUtils';

import { ElementSlug } from '../../../../src/resolvers/common/input/ElementSlug';
import { UserResolver } from '../../../../src/resolvers/user/UserResolver';


describe('UserResolver', () => {

    const testUtils = useIntegrationTestsUtils();

    beforeEach(async () => {
        MockLogger.setupMocks();

        // repositories
        UserRepositorySpy.setupSpies();

        // token managers
        AccessTokenManagerSpy.setupSpies();

        // services
        StorageServiceSpy.setupSpiesAndMockImplementations();
    });

    describe('me query', () => {

        const meQuery = `
            query Me {
              me {
                name
                email
                avatar
                products {
                  id
                }
                projects {
                  name
                }
                inquiries {
                  id
                }
                bookmarkedInquiries
              }
            }
        `;

        describe('validation', () => {

            const send = useValidationUtils<undefined>({
                testUtils,
                resolverSpy: jest.spyOn(UserResolver.prototype, 'me'),
                query: meQuery,
                validFormData: undefined,
            });

            it('should return error when user is not authenticated', async () => {
                await send.withoutAuth().expectNotAuthorizedError();
            });

        });

        it('should return data of the currently authenticated user', async () => {
            StorageServiceSpy.getResources.mockImplementation(() => Promise.resolve([]));
            const user = await testUtils.db.populateWithUser();
            const product1 = await testUtils.db.populateWithProduct(user.id);
            const product2 = await testUtils.db.populateWithProduct(user.id);
            const project = await testUtils.db.populateWithProject(user.id);
            const inquiry = await testUtils.db.populateWithInquiry(user.id);
            const { authHeader, tokenValue } = createAccessToken(user);
            const response = await testUtils.postGraphQL({
                query: meQuery,
            }).set('Authorization', authHeader);

            // verify if access token was verified
            expect(AccessTokenManagerSpy.verify).toHaveBeenCalledTimes(1);
            expect(AccessTokenManagerSpy.verify).toHaveBeenCalledWith(tokenValue);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify query response
            expect(response.body).toEqual({
                data: {
                    me: {
                        name: user.name,
                        email: user.email,
                        avatar: null,
                        products: [
                            { id: product2.id },
                            { id: product1.id },
                        ],
                        projects: [
                            { name: project.name },
                        ],
                        inquiries: [
                            { id: inquiry.id },
                        ],
                        bookmarkedInquiries: [],
                    },
                },
            });
        });

    });

    describe('project details query', () => {

        const projectDetailsQuery = `
            query ProjectDetails($slug: String!) {
              me {
                slug
                project(slug: $slug) {
                  name
                }
              }
            }
        `;

        describe('validation', () => {

            const send = useValidationUtils<ElementSlug>({
                testUtils,
                resolverSpy: jest.spyOn(UserResolver.prototype, 'project'),
                query: projectDetailsQuery,
                validFormData: {
                    slug: 'sample-project',
                },
            });

            it('should return error when user is not authenticated', async () => {
                await send.withoutAuth().expectNotAuthorizedError();
            });

        });

        it('should return project details', async () => {
            const user = await testUtils.db.populateWithUser();
            const project = await testUtils.db.populateWithProject(user.id);
            const formData: ElementSlug = {
                slug: project.slug,
            };
            const response = await testUtils.postGraphQL({
                query: projectDetailsQuery,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    me: {
                        slug: user.slug,
                        project: {
                            name: project.name,
                        },
                    },
                },
            });
        });

        it('should return null when user is not project owner', async () => {
            const projectOwner = await testUtils.db.populateWithUser();
            const user = await testUtils.db.populateWithUser();
            const project = await testUtils.db.populateWithProject(projectOwner.id);
            const formData: ElementSlug = {
                slug: project.slug,
            };
            const response = await testUtils.postGraphQL({
                query: projectDetailsQuery,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    me: {
                        slug: user.slug,
                        project: null,
                    },
                },
            });
        });

        it('should return null when project is not found', async () => {
            const user = await testUtils.db.populateWithUser();
            const formData: ElementSlug = {
                slug: 'not-found',
            };
            const response = await testUtils.postGraphQL({
                query: projectDetailsQuery,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    me: {
                        slug: user.slug,
                        project: null,
                    },
                },
            });
        });

    });

});
