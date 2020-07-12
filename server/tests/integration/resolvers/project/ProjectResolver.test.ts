import { MockLogger } from '../../../__mocks__/utils/logger';

import { useIntegrationTestsUtils } from '../../../__utils__/integration-utils/useIntegrationTestsUtils';
import { ProjectRepositorySpy } from '../../../__utils__/spies/repositories/ProjectRepositorySpy';
import { createAccessToken } from '../../../__utils__/integration-utils/authUtils';
import { generator } from '../../../__utils__/generator';

import { ProjectFormData } from '../../../../src/resolvers/project/input/ProjectFormData';


describe('ProjectResolver', () => {

    const testUtils = useIntegrationTestsUtils();

    beforeEach(async () => {
        MockLogger.setupMocks();

        // repositories
        ProjectRepositorySpy.setupSpies();
    });

    describe('create project resolver ', () => {

        const createProjectMutation = `
            mutation CreateProject($name: String!) {
              createProject(name: $name) {
                id
                name
                slug
              }
            }
        `;

        it('should create project for logged user', async () => {
            const user = await testUtils.db.populateWithUser();
            const projectFormData: ProjectFormData = {
                name: generator.sentence({ words: 5 }).replace(/\./g, ''),
            };
            const response = await testUtils.postGraphQL({
                query: createProjectMutation,
                variables: projectFormData,
            }).set('Authorization', createAccessToken(user).authHeader);

            // verify if new project object was created and saved in db
            expect(ProjectRepositorySpy.create).toHaveBeenCalledTimes(1);
            expect(ProjectRepositorySpy.persistAndFlush).toHaveBeenCalledTimes(1);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    createProject: {
                        id: expect.any(String),
                        name: projectFormData.name,
                        slug: projectFormData.name.toLowerCase().replace(/\s/g, '-'),
                    },
                },
            });
        });

        it('should return error when user is not authenticated', async () => {
            const projectFormData: ProjectFormData = {
                name: generator.sentence({ words: 5 }).replace(/\./g, ''),
            };
            const response = await testUtils.postGraphQL({
                query: createProjectMutation,
                variables: projectFormData,
            });

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
        });

    });

    describe('update project mutation', () => {

        const updateProjectMutation = `
            mutation UpdateProject($id: String, $name: String!) {
              updateProject(id: $id, name: $name) {
                id
                name
                slug
              }
            }
        `;

        it('should return error when user is not a project owner', async () => {
            const projectOwner = await testUtils.db.populateWithUser();
            const user = await testUtils.db.populateWithUser();
            const projectToUpdate = await testUtils.db.populateWithProject(projectOwner.id);
            const response = await testUtils.postGraphQL({
                query: updateProjectMutation,
                variables: { id: projectToUpdate.id, name: 'sample name' },
            }).set('Authorization', createAccessToken(user).authHeader);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access-error' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: null,
                errors: [
                    expect.objectContaining({
                        message: 'RESOURCE_OWNER_ROLE_REQUIRED',
                    }),
                ],
            });
        });

        it('should return error when project is not found', async () => {
            const user = await testUtils.db.populateWithUser();
            const response = await testUtils.postGraphQL({
                query: updateProjectMutation,
                variables: { id: '5f0b4777903f9e20fc1e8a9c', name: 'sample name' },
            }).set('Authorization', createAccessToken(user).authHeader);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access-error' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: null,
                errors: [
                    expect.objectContaining({
                        message: 'PROJECT_NOT_FOUND',
                    }),
                ],
            });
        });

        it('should return error when user is not authenticated', async () => {
            const response = await testUtils.postGraphQL({
                query: updateProjectMutation,
                variables: { id: '5f0b4777903f9e20fc1e8a9c', name: 'sample name' },
            });

            // verify if access was logged
            expect(MockLogger.warn).toHaveBeenCalledTimes(1);
            expect(MockLogger.warn).toHaveBeenCalledWith(expect.objectContaining({ message: 'invalid token' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: null,
                errors: [
                    expect.objectContaining({
                        message: 'INVALID_ACCESS_TOKEN',
                    }),
                ],
            });
        });

    });

    describe('delete project mutation', () => {

        const deleteProjectMutation = `
            mutation DeleteProject($id: String!) {
              deleteProject(id: $id)
            }
        `;

        it('should return true when user is project owner and project exists', async () => {
            const user = await testUtils.db.populateWithUser();
            const projectToDelete = await testUtils.db.populateWithProject(user.id);
            const response = await testUtils.postGraphQL({
                query: deleteProjectMutation,
                variables: { id: projectToDelete.id },
            }).set('Authorization', createAccessToken(user).authHeader);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    deleteProject: true,
                },
            });
        });

        it('should return false when user is not a project owner', async () => {
            const projectOwner = await testUtils.db.populateWithUser();
            const user = await testUtils.db.populateWithUser();
            const projectToDelete = await testUtils.db.populateWithProject(projectOwner.id);
            const response = await testUtils.postGraphQL({
                query: deleteProjectMutation,
                variables: { id: projectToDelete.id },
            }).set('Authorization', createAccessToken(user).authHeader);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access-error' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: null,
                errors: [
                    expect.objectContaining({
                        message: 'RESOURCE_OWNER_ROLE_REQUIRED',
                    }),
                ],
            });
        });

        it('should return false when project is not found', async () => {
            const user = await testUtils.db.populateWithUser();
            const response = await testUtils.postGraphQL({
                query: deleteProjectMutation,
                variables: { id: '5f0b4777903f9e20fc1e8a9c' },
            }).set('Authorization', createAccessToken(user).authHeader);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access-error' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: null,
                errors: [
                    expect.objectContaining({
                        message: 'PROJECT_NOT_FOUND',
                    }),
                ],
            });
        });

        it('should return error when user is not authenticated', async () => {
            const response = await testUtils.postGraphQL({
                query: deleteProjectMutation,
                variables: { id: '5f0b4777903f9e20fc1e8a9c' },
            });

            // verify if access was logged
            expect(MockLogger.warn).toHaveBeenCalledTimes(1);
            expect(MockLogger.warn).toHaveBeenCalledWith(expect.objectContaining({ message: 'invalid token' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: null,
                errors: [
                    expect.objectContaining({
                        message: 'INVALID_ACCESS_TOKEN',
                    }),
                ],
            });
        });

    });

});
