import { FileUpload } from 'graphql-upload';
import { Response } from 'supertest';

import { MockLogger } from '../../../__mocks__/utils/logger';

import { useIntegrationTestsUtils } from '../../../__utils__/integration-utils/useIntegrationTestsUtils';
import { ProjectRepositorySpy } from '../../../__utils__/spies/repositories/ProjectRepositorySpy';
import { StorageServiceSpy } from '../../../__utils__/spies/services/storage/StorageServiceSpy';
import { createAccessToken } from '../../../__utils__/integration-utils/authUtils';
import { generator } from '../../../__utils__/generator';

import { ProjectCreateFormData } from '../../../../src/resolvers/project/input/ProjectCreateFormData';
import { ProjectUpdateFormData } from '../../../../src/resolvers/project/input/ProjectUpdateFormData';
import { ProjectDeleteFormData } from '../../../../src/resolvers/project/input/ProjectDeleteFormData';
import { ResourceCreateFormData } from '../../../../src/resolvers/project/input/ResourceCreateFormData';
import { ResourceDeleteFormData } from '../../../../src/resolvers/project/input/ResourceDeleteFormData';


describe('ProjectResolver', () => {

    const testUtils = useIntegrationTestsUtils();

    beforeEach(async () => {
        MockLogger.setupMocks();

        // repositories
        ProjectRepositorySpy.setupSpies();

        // services
        StorageServiceSpy.setupSpiesAndMockImplementations();
    });

    function expectUserIsNotProjectOwnerError(response: Response) {
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
    }

    function expectProjectNotFoundError(response: Response) {
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
    }

    function expectNotAuthorizedError(response: Response) {
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
    }

    describe('create project mutation ', () => {

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
            const projectCreateFormData: ProjectCreateFormData = {
                name: generator.sentence({ words: 5 }).replace(/\./g, ''),
            };
            const response = await testUtils.postGraphQL({
                query: createProjectMutation,
                variables: projectCreateFormData,
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
                        name: projectCreateFormData.name,
                        slug: projectCreateFormData.name.toLowerCase().replace(/\s/g, '-'),
                    },
                },
            });
        });

        it('should return error when user is not authenticated', async () => {
            const projectCreateFormData: ProjectCreateFormData = {
                name: generator.sentence({ words: 5 }).replace(/\./g, ''),
            };
            const response = await testUtils.postGraphQL({
                query: createProjectMutation,
                variables: projectCreateFormData,
            });
            expectNotAuthorizedError(response);
        });

    });

    describe('update project mutation', () => {

        const updateProjectMutation = `
            mutation UpdateProject($projectId: String!, $name: String!) {
              updateProject(projectId: $projectId, name: $name) {
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
            const projectUpdateFormData: ProjectUpdateFormData = {
                projectId: projectToUpdate.id,
                name: 'sample name',
            };
            const response = await testUtils.postGraphQL({
                query: updateProjectMutation,
                variables: projectUpdateFormData,
            }).set('Authorization', createAccessToken(user).authHeader);
            expectUserIsNotProjectOwnerError(response);
        });

        it('should return error when project is not found', async () => {
            const user = await testUtils.db.populateWithUser();
            const projectUpdateFormData: ProjectUpdateFormData = {
                projectId: '5f0b4777903f9e20fc1e8a9c',
                name: 'sample name',
            };
            const response = await testUtils.postGraphQL({
                query: updateProjectMutation,
                variables: projectUpdateFormData,
            }).set('Authorization', createAccessToken(user).authHeader);
            expectProjectNotFoundError(response);
        });

        it('should return error when user is not authenticated', async () => {
            const projectUpdateFormData: ProjectUpdateFormData = {
                projectId: '5f0b4777903f9e20fc1e8a9c',
                name: 'sample name',
            };
            const response = await testUtils.postGraphQL({
                query: updateProjectMutation,
                variables: projectUpdateFormData,
            });
            expectNotAuthorizedError(response);
        });

    });

    describe('delete project mutation', () => {

        const deleteProjectMutation = `
            mutation DeleteProject($projectId: String!) {
              deleteProject(projectId: $projectId)
            }
        `;

        it('should return true when user is a project owner', async () => {
            const user = await testUtils.db.populateWithUser();
            const projectToDelete = await testUtils.db.populateWithProject(user.id);
            const projectDeleteFormData: ProjectDeleteFormData = {
                projectId: projectToDelete.id,
            };
            const response = await testUtils.postGraphQL({
                query: deleteProjectMutation,
                variables: projectDeleteFormData,
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

        it('should return error when user is not a project owner', async () => {
            const projectOwner = await testUtils.db.populateWithUser();
            const user = await testUtils.db.populateWithUser();
            const projectToDelete = await testUtils.db.populateWithProject(projectOwner.id);
            const projectDeleteFormData: ProjectDeleteFormData = {
                projectId: projectToDelete.id,
            };
            const response = await testUtils.postGraphQL({
                query: deleteProjectMutation,
                variables: projectDeleteFormData,
            }).set('Authorization', createAccessToken(user).authHeader);
            expectUserIsNotProjectOwnerError(response);
        });

        it('should return error when project is not found', async () => {
            const user = await testUtils.db.populateWithUser();
            const projectDeleteFormData: ProjectDeleteFormData = {
                projectId: '5f0b4777903f9e20fc1e8a9c',
            };
            const response = await testUtils.postGraphQL({
                query: deleteProjectMutation,
                variables: projectDeleteFormData,
            }).set('Authorization', createAccessToken(user).authHeader);
            expectProjectNotFoundError(response);
        });

        it('should return error when user is not authenticated', async () => {
            const projectDeleteFormData: ProjectDeleteFormData = {
                projectId: '5f0b4777903f9e20fc1e8a9c',
            };
            const response = await testUtils.postGraphQL({
                query: deleteProjectMutation,
                variables: projectDeleteFormData,
            });
            expectNotAuthorizedError(response);
        });

    });

    describe('upload project file mutation', () => {

        const uploadProjectFileMutation = `
            mutation UploadProjectFile($projectSlug: String!, $file: Upload!, $description: String) {
              uploadProjectFile(projectSlug: $projectSlug, file: $file, description: $description) {
                url
                name
                description
              }
            }
        `;

        beforeEach(() => {
            StorageServiceSpy.uploadResource.mockImplementation((resource) => Promise.resolve({
                url: `url:${resource.userId}/${resource.directory}/${resource.filename}`,
                name: resource.filename,
                description: resource.metadata?.description,
            }));
        });

        function createFile(filename: string): FileUpload {
            return {
                filename: filename,
            } as unknown as FileUpload;
        }

        it('should return uploaded file data when user is a project owner', async () => {
            const user = await testUtils.db.populateWithUser();
            const projectToUpdate = await testUtils.db.populateWithProject(user.id);
            const resourceCreateFormData: ResourceCreateFormData = {
                projectSlug: projectToUpdate.slug,
                file: createFile('sampleFile.pdf'),
                description: 'sample file description',
            };
            const response = await testUtils.postGraphQL({
                query: uploadProjectFileMutation,
                variables: resourceCreateFormData,
            }).set('Authorization', createAccessToken(user).authHeader);

            // verify if resource was uploaded
            expect(StorageServiceSpy.uploadResource).toHaveBeenCalledTimes(1);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    uploadProjectFile: {
                        url: `url:${user.id}/${projectToUpdate.id}/sampleFile.pdf`,
                        name: 'sampleFile.pdf',
                        description: 'sample file description',
                    },
                },
            });
        });

        it('should return error when user is not a project owner', async () => {
            const projectOwner = await testUtils.db.populateWithUser();
            const user = await testUtils.db.populateWithUser();
            const projectToUpdate = await testUtils.db.populateWithProject(projectOwner.id);
            const resourceCreateFormData: ResourceCreateFormData = {
                projectSlug: projectToUpdate.slug,
                file: createFile('sampleFile.pdf'),
                description: 'sample file description',
            };
            const response = await testUtils.postGraphQL({
                query: uploadProjectFileMutation,
                variables: resourceCreateFormData,
            }).set('Authorization', createAccessToken(user).authHeader);
            expectUserIsNotProjectOwnerError(response);
        });

        it('should return error when project is not found', async () => {
            const user = await testUtils.db.populateWithUser();
            const resourceCreateFormData: ResourceCreateFormData = {
                projectSlug: 'not-exiting-project',
                file: createFile('sampleFile.pdf'),
                description: 'sample file description',
            };
            const response = await testUtils.postGraphQL({
                query: uploadProjectFileMutation,
                variables: resourceCreateFormData,
            }).set('Authorization', createAccessToken(user).authHeader);
            expectProjectNotFoundError(response);
        });

        it('should return error when user is not authenticated', async () => {
            const resourceCreateFormData: ResourceCreateFormData = {
                projectSlug: 'some-project',
                file: createFile('sampleFile.pdf'),
                description: 'sample file description',
            };
            const response = await testUtils.postGraphQL({
                query: uploadProjectFileMutation,
                variables: resourceCreateFormData,
            });
            expectNotAuthorizedError(response);
        });

    });

    describe('delete project file mutation', () => {

        const deleteProjectFileMutation = `
            mutation DeleteProjectFile($projectSlug: String!, $resourceName: String!) {
              deleteProjectFile(projectSlug: $projectSlug, resourceName: $resourceName)
            }
        `;

        beforeEach(() => {
            StorageServiceSpy.deleteResources.mockImplementation(() => Promise.resolve());
        });

        it('should return true when user is a project owner', async () => {
            const user = await testUtils.db.populateWithUser();
            const projectToUpdate = await testUtils.db.populateWithProject(user.id);
            const resourceDeleteFormData: ResourceDeleteFormData = {
                projectSlug: projectToUpdate.slug,
                resourceName: 'sampleFile.pdf',
            };
            const response = await testUtils.postGraphQL({
                query: deleteProjectFileMutation,
                variables: resourceDeleteFormData,
            }).set('Authorization', createAccessToken(user).authHeader);

            // verify if resource was deleted
            expect(StorageServiceSpy.deleteResources).toHaveBeenCalledTimes(1);
            expect(StorageServiceSpy.deleteResources).toHaveBeenCalledWith(user.id, projectToUpdate.id, 'sampleFile.pdf');

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    deleteProjectFile: true,
                },
            });
        });

        it('should return error when user is not a project owner', async () => {
            const projectOwner = await testUtils.db.populateWithUser();
            const user = await testUtils.db.populateWithUser();
            const projectToUpdate = await testUtils.db.populateWithProject(projectOwner.id);
            const resourceDeleteFormData: ResourceDeleteFormData = {
                projectSlug: projectToUpdate.slug,
                resourceName: 'sampleFile.pdf',
            };
            const response = await testUtils.postGraphQL({
                query: deleteProjectFileMutation,
                variables: resourceDeleteFormData,
            }).set('Authorization', createAccessToken(user).authHeader);
            expectUserIsNotProjectOwnerError(response);
        });

        it('should return error when project is not found', async () => {
            const user = await testUtils.db.populateWithUser();
            const resourceDeleteFormData: ResourceDeleteFormData = {
                projectSlug: 'not-exiting-project',
                resourceName: 'sampleFile.pdf',
            };
            const response = await testUtils.postGraphQL({
                query: deleteProjectFileMutation,
                variables: resourceDeleteFormData,
            }).set('Authorization', createAccessToken(user).authHeader);
            expectProjectNotFoundError(response);
        });

        it('should return error when user is not authenticated', async () => {
            const resourceDeleteFormData: ResourceDeleteFormData = {
                projectSlug: 'some-project',
                resourceName: 'sampleFile.pdf',
            };
            const response = await testUtils.postGraphQL({
                query: deleteProjectFileMutation,
                variables: resourceDeleteFormData,
            });
            expectNotAuthorizedError(response);
        });

    });

});
