import React from 'react';
import { useRecoilValue } from 'recoil/dist';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { mockUseCurrentUserCachedData } from '../../../__mocks__/code/mockUseCurrentUserCachedData';
import { ContextMocks, MockContextProvider } from '../../../__utils__/MockContextProvider';

import { profileUpdateModalAtom, ProfileUpdateModalAtomValue } from '../../../../code/components/modals/profile-update/profileUpdateModalAtom';
import { ProfileDocument, ProfileQuery, ProfileQueryVariables, User } from '../../../../graphql/generated-types';
import { AuthorizedUserProfilePage } from '../../../../code/components/pages/profile/AuthorizedUserProfilePage';
import { emptyEditorValue } from '../../../../code/components/common/form-fields/ritch-text-editor/options';


describe('AuthorizedUserProfilePage component', () => {

    let updateState: ProfileUpdateModalAtomValue;

    const sampleUser: Partial<User> = {
        __typename: 'User',
        slug: 'sample-user',
        name: 'Sample Name',
    };

    const mockResponseGenerator = {
        success: () => ({
            request: {
                query: ProfileDocument,
                variables: {
                    userSlug: sampleUser.slug,
                } as ProfileQueryVariables,
            },
            result: {
                data: {
                    profile: {
                        __typename: 'Profile',
                        userSlug: sampleUser.slug,
                        name: sampleUser.name,
                        avatar: null,
                        description: null,
                        location: null,
                    },
                } as ProfileQuery,
            },
        }),
    };

    beforeEach(() => {
        mockUseCurrentUserCachedData.mockReturnValue(sampleUser);
    });

    function renderInMockContext(mocks?: ContextMocks) {
        const Handle = () => {
            updateState = useRecoilValue(profileUpdateModalAtom);
            return null;
        };
        return render(
            <MockContextProvider mocks={mocks}>
                <Handle />
                <AuthorizedUserProfilePage />
            </MockContextProvider>,
        );
    }

    class ViewUnderTest {
        static get updateProfileButton() {
            return screen.getByRole('button', { name: 't:user.updateProfile' });
        }
    }

    it('should render update profile button', async () => {
        renderInMockContext({ mockResponses: [ mockResponseGenerator.success() ] });

        // until data loaded - update button should be disabled
        expect(ViewUnderTest.updateProfileButton).toBeVisible();
        expect(ViewUnderTest.updateProfileButton).toBeDisabled();

        await waitFor(() => expect(ViewUnderTest.updateProfileButton).toBeEnabled());

        userEvent.click(ViewUnderTest.updateProfileButton);

        await waitFor(() => expect(updateState).toEqual({
            open: true,
            withExistingAvatar: false,
            profileData: {
                avatar: null,
                description: emptyEditorValue,
                location: null,
            },
        }));
    });

});
