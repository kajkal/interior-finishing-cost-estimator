import { FileUpload } from 'graphql-upload';

import { MockLogger } from '../../../__mocks__/utils/logger';

import { useIntegrationTestsUtils } from '../../../__utils__/integration-utils/useIntegrationTestsUtils';
import { StorageServiceSpy } from '../../../__utils__/spies/services/storage/StorageServiceSpy';
import { UserRepositorySpy } from '../../../__utils__/spies/repositories/UserRepositorySpy';
import { useValidationUtils } from '../../../__utils__/integration-utils/useValidationUtils';
import { getAuthHeader } from '../../../__utils__/integration-utils/authUtils';

import { ProfileUpdateFormData } from '../../../../src/resolvers/user/input/ProfileUpdateFormData';
import { ProfileFormData } from '../../../../src/resolvers/user/input/ProfileFormData';
import { ProfileResolver } from '../../../../src/resolvers/user/ProfileResolver';


describe('ProfileResolver', () => {

    const testUtils = useIntegrationTestsUtils();

    beforeEach(() => {
        MockLogger.setupMocks();

        // repositories
        UserRepositorySpy.setupSpies();

        // services
        StorageServiceSpy.setupSpiesAndMockImplementations();
    });

    describe('profile query', () => {

        const profileQuery = `
            query Profile($userSlug: String!) {
              profile(userSlug: $userSlug) {
                userSlug
                name
                description
                location {
                  placeId
                  main
                  secondary
                }
                avatar
              }
            }
        `;

        describe('validation', () => {

            const send = useValidationUtils<ProfileFormData>({
                testUtils,
                resolverSpy: jest.spyOn(ProfileResolver.prototype, 'profile'),
                query: profileQuery,
                validFormData: {
                    userSlug: 'sample-user',
                },
            });

            it('should be accessible for unauthenticated users', async () => {
                await send.withoutAuth().expectValidationSuccess();
            });

            it('should validate user slug', async () => {
                // should accept valid
                await send.withAuth({ userSlug: 'valid' }).expectValidationSuccess();
                await send.withAuth({ userSlug: 'valid-1' }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ userSlug: '-invalid' }).expectValidationError('userSlug');
                await send.withAuth({ userSlug: 'invalid-' }).expectValidationError('userSlug');
                await send.withAuth({ userSlug: 'in valid' }).expectValidationError('userSlug');
            });

        });

        it('should return user profile data', async () => {
            StorageServiceSpy.getResources.mockImplementation((userId: string, directory: string, prefix?: string) => Promise.resolve([
                {
                    url: `url:${userId}/${directory}/${prefix}_sample.png`,
                    name: `${prefix}_sample.png`,
                    description: undefined,
                    createdAt: new Date(),
                },
            ]));
            const user = await testUtils.db.populateWithUser({
                hidden: false,
                profileDescription: '[{"sample":"description"}]',
                location: {
                    placeId: 'ChIJ0RhONcBEFkcRv4pHdrW2a7Q',
                    main: 'Kraków',
                    secondary: 'Poland',
                },
            });
            const formData: ProfileFormData = {
                userSlug: user.slug,
            };
            const response = await testUtils.postGraphQL({
                query: profileQuery,
                variables: formData,
            });

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    profile: {
                        userSlug: user.slug,
                        name: user.name,
                        description: '[{"sample":"description"}]',
                        location: {
                            placeId: 'ChIJ0RhONcBEFkcRv4pHdrW2a7Q',
                            main: 'Kraków',
                            secondary: 'Poland',
                        },
                        avatar: `url:${user.id}/public/avatar_sample.png`,
                    },
                },
            });
        });

        it('should return user (hidden) profile data on profile owner request', async () => {
            StorageServiceSpy.getResources.mockImplementation(() => Promise.resolve([]));
            const user = await testUtils.db.populateWithUser({
                hidden: true,
                profileDescription: null,
                location: null,
            });
            const formData: ProfileFormData = {
                userSlug: user.slug,
            };
            const response = await testUtils.postGraphQL({
                query: profileQuery,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    profile: {
                        userSlug: user.slug,
                        name: user.name,
                        description: null,
                        location: null,
                        avatar: null,
                    },
                },
            });
        });

        it('should return user not found error when user profile is hidden', async () => {
            const user = await testUtils.db.populateWithUser({
                hidden: true,
            });
            const formData: ProfileFormData = {
                userSlug: user.slug,
            };
            const response = await testUtils.postGraphQL({
                query: profileQuery,
                variables: formData,
            });

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access-error' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: null,
                errors: [
                    expect.objectContaining({
                        message: 'USER_NOT_FOUND',
                    }),
                ],
            });
        });

        it('should return error when user is not found', async () => {
            const formData: ProfileFormData = {
                userSlug: 'not-found',
            };
            const response = await testUtils.postGraphQL({
                query: profileQuery,
                variables: formData,
            });

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access-error' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: null,
                errors: [
                    expect.objectContaining({
                        message: 'USER_NOT_FOUND',
                    }),
                ],
            });
        });

    });

    describe('update profile mutation', () => {

        const updateProfileMutation = `
            mutation UpdateProfile(
              $name: String
              $description: String
              $location: LocationFormData
              $avatar: Upload
              $removeCurrentAvatar: Boolean
            ) {
              updateProfile(
                name: $name
                description: $description
                location: $location
                avatar: $avatar
                removeCurrentAvatar: $removeCurrentAvatar
              ) {
                userSlug
                name
                description
                location {
                  placeId
                  main
                  secondary
                }
                avatar
              }
            }
        `;

        beforeEach(() => {
            StorageServiceSpy.uploadResource.mockImplementation((resource) => Promise.resolve({
                url: `url:${resource.userId}/${resource.directory}/${resource.filename}`,
                name: resource.filename,
                description: resource.metadata?.description,
                createdAt: new Date(),
            }));
        });

        function userWithoutAvatarImplementation(_userId: string, _directory: string, _prefix?: string) {
            return Promise.resolve([]);
        }

        function userWithExistingAvatarImplementation(userId: string, directory: string, prefix?: string) {
            return Promise.resolve([ {
                url: `url:${userId}/${directory}/${prefix}_sample.png`,
                name: `${prefix}_sample.png`,
                description: undefined,
                createdAt: new Date(),
            } ]);
        }

        function createFile(filename: string): FileUpload {
            return {
                filename: filename,
            } as unknown as FileUpload;
        }

        describe('validation', () => {

            const send = useValidationUtils<ProfileUpdateFormData>({
                testUtils,
                resolverSpy: jest.spyOn(ProfileResolver.prototype, 'updateProfile'),
                query: updateProfileMutation,
                validFormData: {
                    name: 'valid name',
                    description: '[{"sample":"rich text description"}]',
                    location: {
                        placeId: 'ChIJ0RhONcBEFkcRv4pHdrW2a7Q',
                        main: 'Kraków',
                        secondary: 'Poland',
                    },
                    avatar: createFile('sample-file.png'),
                    removeCurrentAvatar: false,
                },
            });

            it('should return error when user is not authenticated', async () => {
                await send.withoutAuth().expectNotAuthorizedError();
            });

            it('should validate user name input', async () => {
                // should be optional
                await send.withAuth({ name: null }).expectValidationSuccess();
                await send.withAuth({ name: undefined }).expectValidationSuccess();
                // should accept valid
                await send.withAuth({ name: 'a'.repeat(3) }).expectValidationSuccess();
                await send.withAuth({ name: 'a'.repeat(255) }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ name: 'a'.repeat(2) }).expectValidationError('name');
                await send.withAuth({ name: 'a'.repeat(256) }).expectValidationError('name');
            });

            it('should validate profile description', async () => {
                // should be optional
                await send.withAuth({ description: null }).expectValidationSuccess();
                await send.withAuth({ description: undefined }).expectValidationSuccess();
                // should accept valid
                await send.withAuth({ description: 'a'.repeat(3) }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ description: 'a'.repeat(2) }).expectValidationError('description');
            });

            it('should validate user location', async () => {
                // should be optional
                await send.withAuth({ location: null }).expectValidationSuccess();
                await send.withAuth({ location: undefined }).expectValidationSuccess();
                // should accept valid
                await send.withAuth({
                    location: {
                        placeId: 'ChIJ0RhONcBEFkcRv4pHdrW2a7Q',
                        main: 'Kraków',
                        secondary: 'Poland',
                    },
                }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({
                    location: {
                        placeId: '',
                        main: '',
                        secondary: '',
                    },
                }).expectValidationError('location');
            });

            it('should validate user avatar file', async () => {
                // should be optional
                await send.withAuth({ avatar: null }).expectValidationSuccess();
                await send.withAuth({ avatar: undefined }).expectValidationSuccess();
                // should accept valid
                await send.withAuth({ avatar: {} as FileUpload }).expectValidationSuccess();
            });

            it('should validate remove current avatar flag', async () => {
                // should be optional
                await send.withAuth({ removeCurrentAvatar: null }).expectValidationSuccess();
                await send.withAuth({ removeCurrentAvatar: undefined }).expectValidationSuccess();
                // should accept valid
                await send.withAuth({ removeCurrentAvatar: true }).expectValidationSuccess();
                await send.withAuth({ removeCurrentAvatar: false }).expectValidationSuccess();
            });

        });

        it('should update profile data', async () => {
            StorageServiceSpy.getResources.mockImplementation(userWithoutAvatarImplementation);
            const user = await testUtils.db.populateWithUser({
                profileDescription: '[{"sample":"rich text description"}]',
                location: {
                    placeId: 'ChIJ0RhONcBEFkcRv4pHdrW2a7Q',
                    main: 'Kraków',
                    secondary: 'Poland',
                },
            });
            const formData: ProfileUpdateFormData = {
                description: null,
                location: null,
            };
            const response = await testUtils.postGraphQL({
                query: updateProfileMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));

            // verify if new slug was not generated
            expect(UserRepositorySpy.generateUniqueSlug).toHaveBeenCalledTimes(0);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    updateProfile: {
                        userSlug: user.slug,
                        name: user.name,
                        description: null,
                        location: null,
                        avatar: null,
                    },
                },
            });
        });

        it('should change user name and user slug', async () => {
            StorageServiceSpy.getResources.mockImplementation(userWithoutAvatarImplementation);
            const user = await testUtils.db.populateWithUser();
            const formData: ProfileUpdateFormData = {
                name: 'new user name - new user slug',
            };
            const response = await testUtils.postGraphQL({
                query: updateProfileMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));

            // verify if new slug was generated
            expect(UserRepositorySpy.generateUniqueSlug).toHaveBeenCalledTimes(1);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    updateProfile: {
                        userSlug: 'new-user-name-new-user-slug',
                        name: 'new user name - new user slug',
                        description: null,
                        location: null,
                        avatar: null,
                    },
                },
            });
        });


        it('should upload new avatar', async () => {
            StorageServiceSpy.getResources.mockImplementation(userWithoutAvatarImplementation);
            const user = await testUtils.db.populateWithUser({});
            const formData: ProfileUpdateFormData = {
                avatar: createFile('sample-file.PNG'),
                removeCurrentAvatar: false,
            };
            const response = await testUtils.postGraphQL({
                query: updateProfileMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    updateProfile: {
                        userSlug: user.slug,
                        name: user.name,
                        description: null,
                        location: null,
                        avatar: expect.stringMatching(new RegExp(`url:${user.id}/public/avatar_.{6}\\.PNG`)),
                    },
                },
            });
        });

        it('should remove existing avatar', async () => {
            StorageServiceSpy.getResources.mockImplementation(userWithExistingAvatarImplementation);
            StorageServiceSpy.deleteResources.mockImplementation(() => Promise.resolve());
            const user = await testUtils.db.populateWithUser({});
            const formData: ProfileUpdateFormData = {
                avatar: null,
                removeCurrentAvatar: true,
            };
            const response = await testUtils.postGraphQL({
                query: updateProfileMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));

            // verify if avatar was removed
            expect(StorageServiceSpy.deleteResources).toHaveBeenCalledTimes(1);
            expect(StorageServiceSpy.deleteResources).toHaveBeenCalledWith(user.id, 'public', 'avatar');

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    updateProfile: {
                        userSlug: user.slug,
                        name: user.name,
                        description: null,
                        location: null,
                        avatar: null,
                    },
                },
            });
        });

        it('should replace existing avatar', async () => {
            StorageServiceSpy.getResources.mockImplementation(userWithExistingAvatarImplementation);
            StorageServiceSpy.deleteResources.mockImplementation(() => Promise.resolve());
            const user = await testUtils.db.populateWithUser({});
            const formData: ProfileUpdateFormData = {
                avatar: createFile('sample-file.PNG'),
                removeCurrentAvatar: false,
            };
            const response = await testUtils.postGraphQL({
                query: updateProfileMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));

            // verify if old avatar was removed
            expect(StorageServiceSpy.deleteResources).toHaveBeenCalledTimes(1);
            expect(StorageServiceSpy.deleteResources).toHaveBeenCalledWith(user.id, 'public', 'avatar');

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    updateProfile: {
                        userSlug: user.slug,
                        name: user.name,
                        description: null,
                        location: null,
                        avatar: expect.stringMatching(new RegExp(`url:${user.id}/public/avatar_.{6}\\.PNG`)),
                    },
                },
            });
        });

    });

});
