import { Response } from 'supertest';

import { MockLogger } from '../../../__mocks__/utils/logger';
import { useIntegrationTestsUtils } from '../../../__utils__/integration-utils/useIntegrationTestsUtils';
import { ProjectRepositorySpy } from '../../../__utils__/spies/repositories/ProjectRepositorySpy';
import { useValidationUtils } from '../../../__utils__/integration-utils/useValidationUtils';
import { getAuthHeader } from '../../../__utils__/integration-utils/authUtils';

import { RoomUpdateFormData } from '../../../../src/resolvers/project/input/RoomUpdateFormData';
import { RoomCreateFormData } from '../../../../src/resolvers/project/input/RoomCreateFormData';
import { RoomDeleteFormData } from '../../../../src/resolvers/project/input/RoomDeleteFormData';
import { RoomResolver } from '../../../../src/resolvers/project/RoomResolver';
import { RoomType } from '../../../../src/entities/project/RoomType';


describe('RoomResolver', () => {

    const testUtils = useIntegrationTestsUtils();

    beforeEach(async () => {
        MockLogger.setupMocks();

        // repositories
        ProjectRepositorySpy.setupSpies();
    });

    function expectUserIsNotProductOwnerError(response: Response) {
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

    describe('create room mutation', () => {

        const createRoomMutation = `
            mutation CreateInquiry(
              $projectSlug: String!
              $type: RoomType!
              $name: String!
              $floor: Float
              $wall: Float
              $ceiling: Float
              $productIds: [String!]
              $inquiryIds: [String!]
            ) {
              createRoom(
                projectSlug: $projectSlug
                type: $type
                name: $name
                floor: $floor
                wall: $wall
                ceiling: $ceiling
                productIds: $productIds
                inquiryIds: $inquiryIds
              ) {
                id
                type
                name
                floor
                wall
                ceiling
                productIds
                inquiryIds
              }
            }
        `;

        describe('validation', () => {

            const send = useValidationUtils<RoomCreateFormData>({
                testUtils,
                resolverSpy: jest.spyOn(RoomResolver.prototype, 'createRoom'),
                query: createRoomMutation,
                validFormData: {
                    projectSlug: 'sample-project',
                    type: RoomType.KITCHEN,
                    name: 'Kitchen',
                    floor: null,
                    wall: null,
                    ceiling: null,
                    productIds: null,
                    inquiryIds: null,
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

            it('should validate room type', async () => {
                // should accept valid
                await send.withAuth({ type: RoomType.KITCHEN }).expectValidationSuccess();
                await send.withAuth({ type: 'KITCHEN' as RoomType }).expectValidationSuccess();
            });

            it('should validate room name', async () => {
                // should accept valid
                await send.withAuth({ name: 'a'.repeat(3) }).expectValidationSuccess();
                await send.withAuth({ name: 'a'.repeat(255) }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ name: 'a'.repeat(2) }).expectValidationError('name');
                await send.withAuth({ name: 'a'.repeat(256) }).expectValidationError('name');
            });

            it('should validate room floor area', async () => {
                // should be optional
                await send.withAuth({ floor: null }).expectValidationSuccess();
                await send.withAuth({ floor: undefined }).expectValidationSuccess();
                // should accept valid
                await send.withAuth({ floor: 0 }).expectValidationSuccess();
                await send.withAuth({ floor: 1e5 }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ floor: -1 }).expectValidationError('floor');
                await send.withAuth({ floor: 1e5 + 1 }).expectValidationError('floor');
            });

            it('should validate room wall area', async () => {
                // should be optional
                await send.withAuth({ wall: null }).expectValidationSuccess();
                await send.withAuth({ wall: undefined }).expectValidationSuccess();
                // should accept valid
                await send.withAuth({ wall: 0 }).expectValidationSuccess();
                await send.withAuth({ wall: 1e5 }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ wall: -1 }).expectValidationError('wall');
                await send.withAuth({ wall: 1e5 + 1 }).expectValidationError('wall');
            });

            it('should validate room ceiling area', async () => {
                // should be optional
                await send.withAuth({ ceiling: null }).expectValidationSuccess();
                await send.withAuth({ ceiling: undefined }).expectValidationSuccess();
                // should accept valid
                await send.withAuth({ ceiling: 0 }).expectValidationSuccess();
                await send.withAuth({ ceiling: 1e5 }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ ceiling: -1 }).expectValidationError('ceiling');
                await send.withAuth({ ceiling: 1e5 + 1 }).expectValidationError('ceiling');
            });

            it('should validate product id list', async () => {
                // should be optional
                await send.withAuth({ productIds: null }).expectValidationSuccess();
                await send.withAuth({ productIds: undefined }).expectValidationSuccess();
                // should accept valid
                await send.withAuth({ productIds: [] }).expectValidationSuccess();
                await send.withAuth({ productIds: [ '5f09e24646904045d48e5598' ] }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ productIds: [ 'invalid-id' ] }).expectValidationError('productIds');
                await send.withAuth({ productIds: [ '5f09e24646904045d48e5598', 'invalid-id' ] }).expectValidationError('productIds');
            });

            it('should validate inquiry id list', async () => {
                // should be optional
                await send.withAuth({ inquiryIds: null }).expectValidationSuccess();
                await send.withAuth({ inquiryIds: undefined }).expectValidationSuccess();
                // should accept valid
                await send.withAuth({ inquiryIds: [] }).expectValidationSuccess();
                await send.withAuth({ inquiryIds: [ '5f09e24646904045d48e5598' ] }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ inquiryIds: [ 'invalid-id' ] }).expectValidationError('inquiryIds');
                await send.withAuth({ inquiryIds: [ '5f09e24646904045d48e5598', 'invalid-id' ] }).expectValidationError('inquiryIds');
            });

        });

        it('should create room', async () => {
            const user = await testUtils.db.populateWithUser();
            const projectToUpdate = await testUtils.db.populateWithProject(user.id, {
                rooms: [{
                    id: 'kitchen',
                    type: RoomType.KITCHEN,
                    name: 'Kitchen',
                    floor: null,
                    wall: null,
                    ceiling: null,
                    productIds: null,
                    inquiryIds: null,
                }],
            });
            const formData: RoomCreateFormData = {
                projectSlug: projectToUpdate.slug,
                type: RoomType.KITCHEN,
                name: 'Kitchen',
                floor: 12,
                wall: 42,
                ceiling: 12,
                productIds: [],
                inquiryIds: [],
            };
            const response = await testUtils.postGraphQL({
                query: createRoomMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));

            // verify if room object was created and saved in db
            expect(ProjectRepositorySpy.persistAndFlush).toHaveBeenCalledTimes(1);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    createRoom: {
                        id: 'kitchen-1',
                        type: RoomType.KITCHEN,
                        name: 'Kitchen',
                        floor: 12,
                        wall: 42,
                        ceiling: 12,
                        productIds: [],
                        inquiryIds: [],
                    },
                },
            });
        });

        it('should return error when user is not a project owner', async () => {
            const projectOwner = await testUtils.db.populateWithUser();
            const user = await testUtils.db.populateWithUser();
            const projectToUpdate = await testUtils.db.populateWithProject(projectOwner.id);
            const formData: RoomCreateFormData = {
                projectSlug: projectToUpdate.slug,
                type: RoomType.KITCHEN,
                name: 'Kitchen',
                floor: null,
                wall: null,
                ceiling: null,
                productIds: null,
                inquiryIds: null,
            };
            const response = await testUtils.postGraphQL({
                query: createRoomMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));
            expectUserIsNotProductOwnerError(response);
        });

        it('should return error when project is not found', async () => {
            const user = await testUtils.db.populateWithUser();
            const formData: RoomCreateFormData = {
                projectSlug: 'not-found',
                type: RoomType.KITCHEN,
                name: 'Kitchen',
                floor: null,
                wall: null,
                ceiling: null,
                productIds: null,
                inquiryIds: null,
            };
            const response = await testUtils.postGraphQL({
                query: createRoomMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));
            expectProjectNotFoundError(response);
        });

    });

    describe('update room mutation', () => {

        const updateRoomMutation = `
            mutation UpdateInquiry(
              $projectSlug: String!
              $roomId: String!
              $type: RoomType!
              $name: String!
              $floor: Float
              $wall: Float
              $ceiling: Float
              $productIds: [String!]
              $inquiryIds: [String!]
            ) {
              updateRoom(
                projectSlug: $projectSlug
                roomId: $roomId
                type: $type
                name: $name
                floor: $floor
                wall: $wall
                ceiling: $ceiling
                productIds: $productIds
                inquiryIds: $inquiryIds
              ) {
                id
                type
                name
                floor
                wall
                ceiling
                productIds
                inquiryIds
              }
            }
        `;

        describe('validation', () => {

            const send = useValidationUtils<RoomUpdateFormData>({
                testUtils,
                resolverSpy: jest.spyOn(RoomResolver.prototype, 'updateRoom'),
                query: updateRoomMutation,
                validFormData: {
                    projectSlug: 'sample-project',
                    roomId: 'kitchen',
                    type: RoomType.KITCHEN,
                    name: 'Kitchen',
                    floor: null,
                    wall: null,
                    ceiling: null,
                    productIds: null,
                    inquiryIds: null,
                },
            });

            it('should return error when user is not authenticated', async () => {
                await send.withoutAuth().expectNotAuthorizedError();
            });

            it('should validate room id', async () => {
                // should accept valid
                await send.withAuth({ roomId: 'valid' }).expectValidationSuccess();
                await send.withAuth({ roomId: 'valid-1' }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ roomId: '-invalid' }).expectValidationError('roomId');
                await send.withAuth({ roomId: 'invalid-' }).expectValidationError('roomId');
                await send.withAuth({ roomId: 'in valid' }).expectValidationError('roomId');
            });

            it('should validate room type, name, floor, wall and ceiling area, product and inquiries id lists', async () => {
                await send.withAuth().expectValidationSuccess();
                // verify if RoomUpdateFormData is instance of RoomCreateFormData - and thus inherits its validation
                expect(RoomResolver.prototype.updateRoom).toHaveBeenCalledWith(expect.any(RoomCreateFormData), expect.any(Object));
            });

        });

        it('should update room', async () => {
            const user = await testUtils.db.populateWithUser();
            const projectToUpdate = await testUtils.db.populateWithProject(user.id, {
                rooms: [{
                    id: 'kitchen',
                    type: RoomType.KITCHEN,
                    name: 'Kitchen',
                    floor: null,
                    wall: null,
                    ceiling: null,
                    productIds: null,
                    inquiryIds: null,
                }],
            });
            const formData: RoomUpdateFormData = {
                projectSlug: projectToUpdate.slug,
                roomId: 'kitchen',
                type: RoomType.LIVING_ROOM,
                name: 'Living room',
                floor: 12,
                wall: 42,
                ceiling: 12,
                productIds: ['5f09e24646904045d48e5598'],
                inquiryIds: null,
            };
            const response = await testUtils.postGraphQL({
                query: updateRoomMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));

            // verify if room object was updated and saved in db
            expect(ProjectRepositorySpy.persistAndFlush).toHaveBeenCalledTimes(1);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    updateRoom: {
                        id: 'kitchen',
                        type: RoomType.LIVING_ROOM,
                        name: 'Living room',
                        floor: 12,
                        wall: 42,
                        ceiling: 12,
                        productIds: ['5f09e24646904045d48e5598'],
                        inquiryIds: null,
                    },
                },
            });
        });

        it('should return error when user is not a project owner', async () => {
            const projectOwner = await testUtils.db.populateWithUser();
            const user = await testUtils.db.populateWithUser();
            const projectToUpdate = await testUtils.db.populateWithProject(projectOwner.id);
            const formData: RoomUpdateFormData = {
                projectSlug: projectToUpdate.slug,
                roomId: 'kitchen',
                type: RoomType.KITCHEN,
                name: 'Kitchen',
                floor: null,
                wall: null,
                ceiling: null,
                productIds: null,
                inquiryIds: null,
            };
            const response = await testUtils.postGraphQL({
                query: updateRoomMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));
            expectUserIsNotProductOwnerError(response);
        });

        it('should return error when project is not found', async () => {
            const user = await testUtils.db.populateWithUser();
            const formData: RoomUpdateFormData = {
                projectSlug: 'not-found',
                roomId: 'kitchen',
                type: RoomType.KITCHEN,
                name: 'Kitchen',
                floor: null,
                wall: null,
                ceiling: null,
                productIds: null,
                inquiryIds: null,
            };
            const response = await testUtils.postGraphQL({
                query: updateRoomMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));
            expectProjectNotFoundError(response);
        });

        it('should return error when room is not found', async () => {
            const user = await testUtils.db.populateWithUser();
            const projectToUpdate = await testUtils.db.populateWithProject(user.id);
            const formData: RoomUpdateFormData = {
                projectSlug: projectToUpdate.slug,
                roomId: 'kitchen',
                type: RoomType.KITCHEN,
                name: 'Kitchen',
                floor: null,
                wall: null,
                ceiling: null,
                productIds: null,
                inquiryIds: null,
            };
            const response = await testUtils.postGraphQL({
                query: updateRoomMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access-error' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: null,
                errors: [
                    expect.objectContaining({
                        message: 'ROOM_NOT_FOUND',
                    }),
                ],
            });
        });

    });

    describe('delete room mutation', () => {

        const deleteRoomMutation = `
            mutation DeleteRoom($projectSlug: String!, $roomId: String!) {
              deleteRoom(projectSlug: $projectSlug, roomId: $roomId)
            }
        `;

        describe('validation', () => {

            const send = useValidationUtils<RoomDeleteFormData>({
                testUtils,
                resolverSpy: jest.spyOn(RoomResolver.prototype, 'deleteRoom'),
                query: deleteRoomMutation,
                validFormData: {
                    projectSlug: 'sample-project',
                    roomId: 'kitchen',
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

            it('should validate room id', async () => {
                // should accept valid
                await send.withAuth({ roomId: 'valid' }).expectValidationSuccess();
                await send.withAuth({ roomId: 'valid-1' }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ roomId: '-invalid' }).expectValidationError('roomId');
                await send.withAuth({ roomId: 'invalid-' }).expectValidationError('roomId');
                await send.withAuth({ roomId: 'in valid' }).expectValidationError('roomId');
            });

        });

        it('should delete room', async () => {
            const user = await testUtils.db.populateWithUser();
            const projectToUpdate = await testUtils.db.populateWithProject(user.id, {
                rooms: [{
                    id: 'kitchen',
                    type: RoomType.KITCHEN,
                    name: 'Kitchen',
                    floor: null,
                    wall: null,
                    ceiling: null,
                    productIds: null,
                    inquiryIds: null,
                }],
            });
            const formData: RoomDeleteFormData = {
                projectSlug: projectToUpdate.slug,
                roomId: 'kitchen',
            };
            const response = await testUtils.postGraphQL({
                query: deleteRoomMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    deleteRoom: true,
                },
            });
        });

        it('should return error when user is not a project owner', async () => {
            const projectOwner = await testUtils.db.populateWithUser();
            const user = await testUtils.db.populateWithUser();
            const projectToUpdate = await testUtils.db.populateWithProject(projectOwner.id);
            const formData: RoomDeleteFormData = {
                projectSlug: projectToUpdate.slug,
                roomId: 'kitchen',
            };
            const response = await testUtils.postGraphQL({
                query: deleteRoomMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));
            expectUserIsNotProductOwnerError(response);
        });

        it('should return error when project is not found', async () => {
            const user = await testUtils.db.populateWithUser();
            const formData: RoomDeleteFormData = {
                projectSlug: 'not-found',
                roomId: 'kitchen',
            };
            const response = await testUtils.postGraphQL({
                query: deleteRoomMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));
            expectProjectNotFoundError(response);
        });

    });

});
