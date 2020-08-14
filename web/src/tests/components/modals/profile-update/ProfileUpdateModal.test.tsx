/**
 * @jest-environment jsdom-sixteen
 *
 * ^ because of 'Error: Uncaught [TypeError: window.getSelection is not a function]'
 */

import React from 'react';
import { useSetRecoilState } from 'recoil/dist';
import { useTranslation } from 'react-i18next';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';

import { mockUseCurrentUserCachedData } from '../../../__mocks__/code/mockUseCurrentUserCachedData';
import { LocationFieldController } from '../../../__utils__/field-controllers/LocationFieldController';
import { DropzoneAreaController } from '../../../__utils__/field-controllers/DropzoneAreaController';
import { EditorFieldController } from '../../../__utils__/field-controllers/EditorFieldController';
import { TextFieldController } from '../../../__utils__/field-controllers/TextFieldController';
import { ContextMocks, MockContextProvider } from '../../../__utils__/MockContextProvider';

import { Profile, UpdateProfileDocument, UpdateProfileMutation, UpdateProfileMutationVariables, User } from '../../../../graphql/generated-types';
import { profileUpdateModalAtom } from '../../../../code/components/modals/profile-update/profileUpdateModalAtom';
import { ProfileUpdateModal } from '../../../../code/components/modals/profile-update/ProfileUpdateModal';
import { initApolloCache } from '../../../../code/components/providers/apollo/client/initApolloClient';
import { mapProfileToProfileUpdateFormData } from '../../../../code/utils/mappers/profileMapper';


describe('ProfileUpdateModal component', () => {

    const sampleUser: Partial<User> = {
        __typename: 'User',
        slug: 'sample-user',
        name: 'Sample Name',
        avatar: null,
    };

    const sampleProfile: Profile = {
        __typename: 'Profile',
        userSlug: 'sample-user',
        name: 'Sample Name',
        avatar: null,
        description: null,
        location: null,
    };

    beforeEach(() => {
        mockUseCurrentUserCachedData.mockReturnValue(sampleUser);
    });

    function renderInMockContext(profile: Profile = sampleProfile, mocks?: ContextMocks) {
        const OpenModalButton = () => {
            const { t } = useTranslation();
            const setModalState = useSetRecoilState(profileUpdateModalAtom);
            return (
                <button
                    data-testid='open-modal-button'
                    onClick={() => setModalState({
                        open: true,
                        withExistingAvatar: Boolean(profile.avatar),
                        profileData: mapProfileToProfileUpdateFormData(profile, t),
                    })}
                />
            );
        };
        return render(
            <MockContextProvider mocks={mocks}>
                <OpenModalButton />
                <ProfileUpdateModal isMobile={false} />
            </MockContextProvider>,
        );
    }

    function initApolloTestCache(user = sampleUser, profile = sampleProfile) {
        const cache = initApolloCache();
        return cache.restore({
            [ cache.identify(profile)! ]: profile,
            [ cache.identify(user)! ]: user,
            ROOT_QUERY: {
                __typename: 'Query',
                [ `profile({"userSlug":"${user.slug}"})` ]: { __ref: cache.identify(profile) },
            },
        });
    }

    class ViewUnderTest {
        static get modal() {
            return screen.queryByLabelText(`t:user.updateProfileModal.title`);
        }
        static get nameInput() {
            return screen.getByLabelText('t:form.name.label', { selector: 'input' });
        }
        static get avatarDropzone() {
            return screen.getByLabelText('t:form.avatar.label');
        }
        static get profileDescriptionInput() {
            return screen.getByTestId('slate-editor');
        }
        static get locationInput() {
            return screen.getByLabelText(/t:form.location.label/, { selector: 'input' });
        }
        static get cancelButton() {
            return screen.getByRole('button', { name: 't:form.common.cancel' });
        }
        static get submitButton() {
            return screen.getByRole('button', { name: 't:form.common.update' });
        }
        static async openModal() {
            userEvent.click(screen.getByTestId('open-modal-button'));
            await waitFor(() => expect(ViewUnderTest.modal).toBeVisible());
        }
        static async fillAndSubmitForm(data: UpdateProfileMutationVariables) {
            await ViewUnderTest.openModal();

            data.name && await TextFieldController.from(ViewUnderTest.nameInput)
                .type(data.name);
            await DropzoneAreaController.from(ViewUnderTest.avatarDropzone)
                .dropFiles([ data.avatar ].filter(Boolean));
            await EditorFieldController.from(ViewUnderTest.profileDescriptionInput)
                .typeInEditor('Sample profile description');
            await LocationFieldController.from(ViewUnderTest.locationInput)
                .selectLocation(data.location);

            userEvent.click(ViewUnderTest.submitButton);
        }
    }

    it('should close modal on cancel button click', async () => {
        renderInMockContext();

        // verify if modal is not visible
        expect(ViewUnderTest.modal).toBeNull();

        await ViewUnderTest.openModal();

        // verify if modal is visible
        expect(ViewUnderTest.modal).toBeVisible();

        userEvent.click(ViewUnderTest.cancelButton);

        // verify if modal is again not visible
        await waitFor(() => expect(ViewUnderTest.modal).toBeNull());
    });

    describe('profile update form', () => {

        const mockResponseGenerator = {
            success: () => ({
                request: {
                    query: UpdateProfileDocument,
                    variables: {
                        name: null,
                        avatar: new File([ ':o <- me' ], 'sample-file.png', { type: 'image/png' }),
                        description: '[{"children":[{"type":"p","children":[{"text":"Sample profile description"}]}]}]',
                        location: {
                            placeId: 'ChIJ0RhONcBEFkcRv4pHdrW2a7Q',
                            main: 'Kraków',
                            secondary: 'Poland',
                            lat: undefined,
                            lng: undefined,
                        },
                        removeCurrentAvatar: false,
                    } as UpdateProfileMutationVariables,
                },
                result: {
                    data: {
                        updateProfile: {
                            __typename: 'Profile',
                            userSlug: 'sample-user',
                            name: 'Sample Name',
                            avatar: 'sample-avatar-url',
                            description: '[{"children":[{"type":"p","children":[{"text":"Sample profile description"}]}]}]',
                            location: {
                                placeId: 'ChIJ0RhONcBEFkcRv4pHdrW2a7Q',
                                main: 'Kraków',
                                secondary: 'Poland',
                                lat: null,
                                lng: null,
                            },
                        },
                    } as UpdateProfileMutation,
                },
            }),
            successWithNameChange: () => ({
                request: {
                    query: UpdateProfileDocument,
                    variables: {
                        name: 'Updated Name',
                        avatar: null,
                        description: '[{"children":[{"type":"p","children":[{"text":"Sample profile description"}]}]}]',
                        location: null,
                        removeCurrentAvatar: false,
                    } as UpdateProfileMutationVariables,
                },
                result: {
                    data: {
                        updateProfile: {
                            __typename: 'Profile',
                            userSlug: 'updated-name',
                            name: 'Updated Name',
                            avatar: null,
                            description: '[{"children":[{"type":"p","children":[{"text":"Sample profile description"}]}]}]',
                            location: null,
                        },
                    } as UpdateProfileMutation,
                },
            }),
            successWithDelete: () => ({
                request: {
                    query: UpdateProfileDocument,
                    variables: {
                        name: null,
                        avatar: null,
                        description: '[{"children":[{"type":"p","children":[{"text":"Sample profile description"}]}]}]',
                        location: null,
                        removeCurrentAvatar: true,
                    } as UpdateProfileMutationVariables,
                },
                result: {
                    data: {
                        updateProfile: {
                            __typename: 'Profile',
                            userSlug: 'sample-user',
                            name: 'Sample Name',
                            avatar: null,
                            description: '[{"children":[{"type":"p","children":[{"text":"Sample profile description"}]}]}]',
                            location: null,
                        },
                    } as UpdateProfileMutation,
                },
            }),
        };

        describe('validation', () => {

            it('should validate name input value', async () => {
                renderInMockContext();
                await ViewUnderTest.openModal();
                expect(ViewUnderTest.nameInput).toHaveFocus();

                await TextFieldController.from(ViewUnderTest.nameInput)
                    .type('').expectError('t:form.name.validation.required')
                    .type('a'.repeat(2)).expectError('t:form.name.validation.tooShort')
                    .type('a'.repeat(3)).expectNoError()
                    .paste('a'.repeat(51)).expectError('t:form.name.validation.tooLong')
                    .paste('a'.repeat(50)).expectNoError()
                    .type('valid name').expectNoError();
            });

        });

        it('should successfully update user\' profile and close modal', async () => {
            const cache = initApolloTestCache();
            const mockResponse = mockResponseGenerator.success();
            renderInMockContext(sampleProfile, { mockResponses: [ mockResponse ], apolloCache: cache });

            const userCacheRecordKey = cache.identify(sampleUser)!;
            const profileCacheRecordKey = cache.identify(sampleProfile)!;

            // verify initial cache records
            expect(cache.extract()).toEqual({
                [ profileCacheRecordKey ]: sampleProfile,
                [ userCacheRecordKey ]: {
                    ...sampleUser,
                    avatar: null,
                },
                ROOT_QUERY: expect.any(Object),
            });

            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if modal was closed
            await waitForElementToBeRemoved(ViewUnderTest.modal);

            // verify updated cache
            const updateProfile = mockResponse.result.data.updateProfile;
            const updateProfileCacheRecordKey = cache.identify(updateProfile)!;
            expect(updateProfileCacheRecordKey).toBe(profileCacheRecordKey);
            expect(cache.extract()).toEqual({
                [ profileCacheRecordKey ]: updateProfile, // <- updated profile record
                [ userCacheRecordKey ]: {
                    ...sampleUser,
                    avatar: 'sample-avatar-url', // <- updated current user avatar url
                },
                ROOT_QUERY: expect.any(Object),
                ROOT_MUTATION: expect.any(Object),
            });
        });

        it('should update cache when user name changes', async () => {
            const cache = initApolloTestCache();
            const mockResponse = mockResponseGenerator.successWithNameChange();
            renderInMockContext(sampleProfile, { mockResponses: [ mockResponse ], apolloCache: cache });

            const userCacheRecordKey = cache.identify(sampleUser)!;
            const profileCacheRecordKey = cache.identify(sampleProfile)!;

            // verify initial cache records
            expect(cache.extract()).toEqual({
                [ profileCacheRecordKey ]: sampleProfile,
                [ userCacheRecordKey ]: sampleUser,
                ROOT_QUERY: {
                    __typename: 'Query',
                    [ `profile({"userSlug":"${sampleUser.slug}"})` ]: { __ref: cache.identify(sampleProfile) },
                },
            });

            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if modal was closed
            await waitForElementToBeRemoved(ViewUnderTest.modal);

            // verify updated cache
            const updatedProfile = mockResponse.result.data.updateProfile;
            const updatedProfileCacheRecordKey = cache.identify(updatedProfile)!;
            const updateUserCacheRecordKey = cache.identify({ __typename: 'User', slug: updatedProfile.userSlug })!;

            expect(updatedProfileCacheRecordKey).not.toBe(profileCacheRecordKey);
            expect(userCacheRecordKey).not.toBe(updateUserCacheRecordKey);

            expect(cache.extract()).toEqual({
                // <- removed old profile record
                [ updatedProfileCacheRecordKey ]: updatedProfile, // <- new/updated profile record
                // <- removed old user record
                [ updateUserCacheRecordKey ]: { // <- updated user record
                    ...sampleUser,
                    name: updatedProfile.name,
                    slug: updatedProfile.userSlug,
                },
                ROOT_QUERY: {
                    __typename: 'Query',
                    me: { __ref: updateUserCacheRecordKey }, // <- updated me query result
                    [ `profile({"userSlug":"${sampleUser.slug}"})` ]: null, // <- cleared old profile data
                    [ `profile({"userSlug":"${updatedProfile.userSlug}"})` ]: { __ref: cache.identify(updatedProfile) }, // <- updated profile query result data
                },
                ROOT_MUTATION: expect.any(Object),
            });
        });

        it('should remove current profile picture', async () => {
            const cache = initApolloTestCache({
                ...sampleUser,
                avatar: 'sample-avatar-url',
            });
            const mockResponse = mockResponseGenerator.successWithDelete();
            renderInMockContext({
                ...sampleProfile,
                avatar: 'sample-avatar-url',
            }, { mockResponses: [ mockResponse ], apolloCache: cache });

            const userCacheRecordKey = cache.identify(sampleUser)!;
            const profileCacheRecordKey = cache.identify(sampleProfile)!;

            // verify initial cache records
            expect(cache.extract()).toEqual({
                [ profileCacheRecordKey ]: sampleProfile,
                [ userCacheRecordKey ]: {
                    ...sampleUser,
                    avatar: 'sample-avatar-url',
                },
                ROOT_QUERY: expect.any(Object),
            });

            await ViewUnderTest.openModal();
            await DropzoneAreaController.from(ViewUnderTest.avatarDropzone).removeFile('t:user.currentAvatar');
            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if modal was closed
            await waitForElementToBeRemoved(ViewUnderTest.modal);

            // verify updated cache
            const updateProfile = mockResponse.result.data.updateProfile;
            const updateProfileCacheRecordKey = cache.identify(updateProfile)!;
            expect(updateProfileCacheRecordKey).toBe(profileCacheRecordKey);
            expect(cache.extract()).toEqual({
                [ profileCacheRecordKey ]: updateProfile, // <- updated profile record
                [ userCacheRecordKey ]: {
                    ...sampleUser,
                    avatar: null, // <- updated current user avatar url
                },
                ROOT_MUTATION: expect.any(Object),
                ROOT_QUERY: expect.any(Object),
            });
        });

    });

});
