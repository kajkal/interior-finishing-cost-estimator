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

import { LocationFieldController } from '../../../__utils__/field-controllers/LocationFieldController';
import { DropzoneAreaController } from '../../../__utils__/field-controllers/DropzoneAreaController';
import { EditorFieldController } from '../../../__utils__/field-controllers/EditorFieldController';
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

    function initApolloTestCache() {
        const cache = initApolloCache();
        return cache.restore({
            [ cache.identify(sampleUser)! ]: sampleUser,
        });
    }

    class ViewUnderTest {
        static get modal() {
            return screen.queryByLabelText(`t:user.updateProfileModal.title`);
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

            await DropzoneAreaController.from(ViewUnderTest.avatarDropzone)
                .dropFiles([data.avatar].filter(Boolean))
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
                        avatar: new File([ ':o <- me' ], 'sample-file.png', { type: 'image/png' }),
                        description: '[{"children":[{"type":"p","children":[{"text":"Sample profile description"}]}]}]',
                        location: {
                            placeId: 'ChIJ0RhONcBEFkcRv4pHdrW2a7Q',
                            main: 'Kraków',
                            secondary: 'Poland',
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
                            },
                        },
                    } as UpdateProfileMutation,
                },
            }),
            successWithDelete: () => ({
                request: {
                    query: UpdateProfileDocument,
                    variables: {
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
            })
        };

        it('should successfully update user\' profile and close modal', async () => {
            const cache = initApolloTestCache();
            const mockResponse = mockResponseGenerator.success();
            renderInMockContext(sampleProfile, { mockResponses: [ mockResponse ], apolloCache: cache });

            const userCacheRecordKey = cache.identify(sampleUser)!;

            // verify initial cache records
            expect(cache.extract()).toEqual({
                [ userCacheRecordKey ]: {
                    ...sampleUser,
                    avatar: null,
                },
            });

            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if modal was closed
            await waitForElementToBeRemoved(ViewUnderTest.modal);

            // verify updated cache
            const updateProfile = mockResponse.result.data.updateProfile;
            const updateProfileCacheRecordKey = cache.identify(updateProfile)!;
            expect(cache.extract()).toEqual({
                [ updateProfileCacheRecordKey ]: updateProfile, // <- updated profile record
                [ userCacheRecordKey ]: {
                    ...sampleUser,
                    avatar: 'sample-avatar-url', // <- updated current user avatar url
                },
                'ROOT_MUTATION': expect.any(Object),
            });
        });

        it('should remove current profile picture', async () => {
            const cache = initApolloTestCache();
            cache.restore({
                [ cache.identify(sampleUser)! ]: {
                    ...sampleUser,
                    avatar: 'sample-avatar-url'
                },
            });
            const mockResponse = mockResponseGenerator.successWithDelete();
            renderInMockContext({
                ...sampleProfile,
                avatar: 'sample-avatar-url',
            }, { mockResponses: [ mockResponse ], apolloCache: cache });

            const userCacheRecordKey = cache.identify(sampleUser)!;

            // verify initial cache records
            expect(cache.extract()).toEqual({
                [ userCacheRecordKey ]: {
                    ...sampleUser,
                    avatar: 'sample-avatar-url'
                },
            });

            await ViewUnderTest.openModal();
            await DropzoneAreaController.from(ViewUnderTest.avatarDropzone).removeFile('t:user.currentAvatar');
            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if modal was closed
            await waitForElementToBeRemoved(ViewUnderTest.modal);

            // verify updated cache
            const updateProfile = mockResponse.result.data.updateProfile;
            const updateProfileCacheRecordKey = cache.identify(updateProfile)!;
            expect(cache.extract()).toEqual({
                [ updateProfileCacheRecordKey ]: updateProfile, // <- updated profile record
                [ userCacheRecordKey ]: {
                    ...sampleUser,
                    avatar: null, // <- updated current user avatar url
                },
                'ROOT_MUTATION': expect.any(Object),
            });
        });

    });

});
