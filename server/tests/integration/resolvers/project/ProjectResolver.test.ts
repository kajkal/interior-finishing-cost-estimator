import { FileUpload } from 'graphql-upload';
import { Response } from 'supertest';

import { MockLogger } from '../../../__mocks__/utils/logger';

import { useIntegrationTestsUtils } from '../../../__utils__/integration-utils/useIntegrationTestsUtils';
import { ProjectRepositorySpy } from '../../../__utils__/spies/repositories/ProjectRepositorySpy';
import { StorageServiceSpy } from '../../../__utils__/spies/services/storage/StorageServiceSpy';
import { useValidationUtils } from '../../../__utils__/integration-utils/useValidationUtils';
import { getAuthHeader } from '../../../__utils__/integration-utils/authUtils';
import { generator } from '../../../__utils__/generator';

import { ProjectCreateFormData } from '../../../../src/resolvers/project/input/ProjectCreateFormData';
import { ProjectUpdateFormData } from '../../../../src/resolvers/project/input/ProjectUpdateFormData';
import { ProjectDeleteFormData } from '../../../../src/resolvers/project/input/ProjectDeleteFormData';
import { ResourceCreateFormData } from '../../../../src/resolvers/project/input/ResourceCreateFormData';
import { ResourceDeleteFormData } from '../../../../src/resolvers/project/input/ResourceDeleteFormData';
import { ProjectResolver } from '../../../../src/resolvers/project/ProjectResolver';


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

        describe('validation', () => {

            const send = useValidationUtils<ProjectCreateFormData>({
                testUtils,
                resolverSpy: jest.spyOn(ProjectResolver.prototype, 'createProject'),
                query: createProjectMutation,
                validFormData: {
                    name: 'Sample project name',
                },
            });

            it('should return error when user is not authenticated', async () => {
                await send.withoutAuth().expectNotAuthorizedError();
            });

            it('should validate project name', async () => {
                // should accept valid
                await send.withAuth({ name: 'a'.repeat(3) }).expectValidationSuccess();
                await send.withAuth({ name: 'a'.repeat(64) }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ name: 'a'.repeat(2) }).expectValidationError('name');
                await send.withAuth({ name: 'a'.repeat(65) }).expectValidationError('name');
            });

        });

        it('should create project', async () => {
            const user = await testUtils.db.populateWithUser();
            const projectCreateFormData: ProjectCreateFormData = {
                name: generator.sentence({ words: 5 }).replace(/\./g, ''),
            };
            const response = await testUtils.postGraphQL({
                query: createProjectMutation,
                variables: projectCreateFormData,
            }).set('Authorization', getAuthHeader(user));

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

    });

    describe('update project mutation', () => {

        const updateProjectMutation = `
            mutation UpdateProject($projectSlug: String!, $name: String!) {
              updateProject(projectSlug: $projectSlug, name: $name) {
                name
                slug
              }
            }
        `;

        describe('validation', () => {

            const send = useValidationUtils<ProjectUpdateFormData>({
                testUtils,
                resolverSpy: jest.spyOn(ProjectResolver.prototype, 'updateProject'),
                query: updateProjectMutation,
                validFormData: {
                    projectSlug: 'sample-valid-slug',
                    name: 'sample name',
                },
            });

            it('should return error when user is not authenticated', async () => {
                await send.withoutAuth().expectNotAuthorizedError();
            });

            it('should validate project slug', async () => {
                // should accept valid
                await send.withAuth({ projectSlug: 'valid' }).expectValidationSuccess();
                await send.withAuth({ projectSlug: 'valid-1' }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ projectSlug: '-invalid' }).expectValidationError('projectSlug');
                await send.withAuth({ projectSlug: 'invalid-' }).expectValidationError('projectSlug');
                await send.withAuth({ projectSlug: 'in valid' }).expectValidationError('projectSlug');
            });

            it('should validate project updated name', async () => {
                // should accept valid
                await send.withAuth({ name: 'a'.repeat(3) }).expectValidationSuccess();
                await send.withAuth({ name: 'a'.repeat(64) }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ name: 'a'.repeat(2) }).expectValidationError('name');
                await send.withAuth({ name: 'a'.repeat(65) }).expectValidationError('name');
            });

        });

        it('should return error when user is not a project owner', async () => {
            const projectOwner = await testUtils.db.populateWithUser();
            const user = await testUtils.db.populateWithUser();
            const projectToUpdate = await testUtils.db.populateWithProject(projectOwner.id);
            const projectUpdateFormData: ProjectUpdateFormData = {
                projectSlug: projectToUpdate.slug,
                name: 'sample name',
            };
            const response = await testUtils.postGraphQL({
                query: updateProjectMutation,
                variables: projectUpdateFormData,
            }).set('Authorization', getAuthHeader(user));
            expectUserIsNotProjectOwnerError(response);
        });

        it('should return error when project is not found', async () => {
            const user = await testUtils.db.populateWithUser();
            const projectUpdateFormData: ProjectUpdateFormData = {
                projectSlug: 'not-found',
                name: 'Not Found',
            };
            const response = await testUtils.postGraphQL({
                query: updateProjectMutation,
                variables: projectUpdateFormData,
            }).set('Authorization', getAuthHeader(user));
            expectProjectNotFoundError(response);
        });

    });

    describe('delete project mutation', () => {

        const deleteProjectMutation = `
            mutation DeleteProject($projectSlug: String!) {
              deleteProject(projectSlug: $projectSlug)
            }
        `;

        describe('validation', () => {

            const send = useValidationUtils<ProjectDeleteFormData>({
                testUtils,
                resolverSpy: jest.spyOn(ProjectResolver.prototype, 'deleteProject'),
                query: deleteProjectMutation,
                validFormData: {
                    projectSlug: 'sample-valid-slug',
                },
            });

            it('should return error when user is not authenticated', async () => {
                await send.withoutAuth().expectNotAuthorizedError();
            });

            it('should validate project slug', async () => {
                // should accept valid
                await send.withAuth({ projectSlug: 'valid' }).expectValidationSuccess();
                await send.withAuth({ projectSlug: 'valid-1' }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ projectSlug: '-invalid' }).expectValidationError('projectSlug');
                await send.withAuth({ projectSlug: 'invalid-' }).expectValidationError('projectSlug');
                await send.withAuth({ projectSlug: 'in valid' }).expectValidationError('projectSlug');
            });

        });

        it('should return true when user is a project owner', async () => {
            const user = await testUtils.db.populateWithUser();
            const projectToDelete = await testUtils.db.populateWithProject(user.id);
            const projectDeleteFormData: ProjectDeleteFormData = {
                projectSlug: projectToDelete.slug,
            };
            const response = await testUtils.postGraphQL({
                query: deleteProjectMutation,
                variables: projectDeleteFormData,
            }).set('Authorization', getAuthHeader(user));

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
                projectSlug: projectToDelete.slug,
            };
            const response = await testUtils.postGraphQL({
                query: deleteProjectMutation,
                variables: projectDeleteFormData,
            }).set('Authorization', getAuthHeader(user));
            expectUserIsNotProjectOwnerError(response);
        });

        it('should return error when project is not found', async () => {
            const user = await testUtils.db.populateWithUser();
            const projectDeleteFormData: ProjectDeleteFormData = {
                projectSlug: 'not-found',
            };
            const response = await testUtils.postGraphQL({
                query: deleteProjectMutation,
                variables: projectDeleteFormData,
            }).set('Authorization', getAuthHeader(user));
            expectProjectNotFoundError(response);
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

        describe('validation', () => {

            const send = useValidationUtils<ResourceCreateFormData>({
                testUtils,
                resolverSpy: jest.spyOn(ProjectResolver.prototype, 'uploadProjectFile'),
                query: uploadProjectFileMutation,
                validFormData: {
                    projectSlug: 'sample-valid-slug',
                    file: createFile('sampleFile.pdf'),
                    description: 'sample file description',
                },
            });

            it('should return error when user is not authenticated', async () => {
                await send.withoutAuth().expectNotAuthorizedError();
            });

            it('should validate project slug', async () => {
                // should accept valid
                await send.withAuth({ projectSlug: 'valid' }).expectValidationSuccess();
                await send.withAuth({ projectSlug: 'valid-1' }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ projectSlug: '-invalid' }).expectValidationError('projectSlug');
                await send.withAuth({ projectSlug: 'invalid-' }).expectValidationError('projectSlug');
                await send.withAuth({ projectSlug: 'in valid' }).expectValidationError('projectSlug');
            });

            it('should validate uploaded file', async () => {
                // should accept valid
                await send.withAuth({ file: {} as FileUpload }).expectValidationSuccess();
            });

            it('should validate uploaded file description', async () => {
                // should be optional
                await send.withAuth({ description: null }).expectValidationSuccess();
                await send.withAuth({ description: undefined }).expectValidationSuccess();
                // should accept valid
                await send.withAuth({ description: 'a'.repeat(1) }).expectValidationSuccess();
                await send.withAuth({ description: 'a'.repeat(255) }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ description: '' }).expectValidationError('description');
                await send.withAuth({ description: 'a'.repeat(256) }).expectValidationError('description');
            });

        });

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
            }).set('Authorization', getAuthHeader(user));

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
            }).set('Authorization', getAuthHeader(user));
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
            }).set('Authorization', getAuthHeader(user));
            expectProjectNotFoundError(response);
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

        describe('validation', () => {

            const send = useValidationUtils<ResourceDeleteFormData>({
                testUtils,
                resolverSpy: jest.spyOn(ProjectResolver.prototype, 'deleteProjectFile'),
                query: deleteProjectFileMutation,
                validFormData: {
                    projectSlug: 'sample-valid-slug',
                    resourceName: 'sampleFile.pdf',
                },
            });

            it('should return error when user is not authenticated', async () => {
                await send.withoutAuth().expectNotAuthorizedError();
            });

            it('should validate project slug', async () => {
                // should accept valid
                await send.withAuth({ projectSlug: 'valid' }).expectValidationSuccess();
                await send.withAuth({ projectSlug: 'valid-1' }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ projectSlug: '-invalid' }).expectValidationError('projectSlug');
                await send.withAuth({ projectSlug: 'invalid-' }).expectValidationError('projectSlug');
                await send.withAuth({ projectSlug: 'in valid' }).expectValidationError('projectSlug');
            });

            it('should validate resource to delete name', async () => {
                // should accept valid
                await send.withAuth({ resourceName: 'a'.repeat(1) }).expectValidationSuccess();
                await send.withAuth({ resourceName: 'a'.repeat(255) }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ resourceName: '' }).expectValidationError('resourceName');
                await send.withAuth({ resourceName: 'a'.repeat(256) }).expectValidationError('resourceName');
            });

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
            }).set('Authorization', getAuthHeader(user));

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
            }).set('Authorization', getAuthHeader(user));
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
            }).set('Authorization', getAuthHeader(user));
            expectProjectNotFoundError(response);
        });

    });

});
