import React from 'react';
import { useRecoilValue } from 'recoil/dist';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { mockUseCurrentUserCachedData } from '../../../__mocks__/code/mockUseCurrentUserCachedData';
import { ContextMocks, MockContextProvider } from '../../../__utils__/mocks/MockContextProvider';
import { generator } from '../../../__utils__/generator';

import { profileUpdateModalAtom, ProfileUpdateModalAtomValue } from '../../../../code/components/modals/profile-update/profileUpdateModalAtom';
import { AuthorizedUserProfilePage } from '../../../../code/components/pages/profile/AuthorizedUserProfilePage';
import { emptyEditorValue } from '../../../../code/components/common/form-fields/ritch-text-editor/options';
import { ProfileDocument, ProfileQuery, ProfileQueryVariables } from '../../../../graphql/generated-types';


describe('AuthorizedUserProfilePage component', () => {

    let updateState: ProfileUpdateModalAtomValue;

    const sampleUser = generator.user();

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

        await waitFor(() => expect(ViewUnderTest.updateProfileButton).toBeVisible());

        userEvent.click(ViewUnderTest.updateProfileButton);

        await waitFor(() => expect(updateState).toEqual({
            open: true,
            withExistingAvatar: false,
            profileData: {
                name: sampleUser.name,
                avatar: null,
                description: emptyEditorValue,
                location: null,
            },
        }));
    });

});
