import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { mockUseCurrentUserCachedData } from '../../../__mocks__/code/mockUseCurrentUserCachedData';
import { ContextMocks, MockContextProvider } from '../../../__utils__/MockContextProvider';

import { ChangeProfileSettingsDocument, ChangeProfileSettingsMutation, ChangeProfileSettingsMutationVariables, User } from '../../../../graphql/generated-types';
import { ChangeProfileSettingsForm } from '../../../../code/components/pages/settings/ChangeProfileSettingsForm';
import { initApolloCache } from '../../../../code/components/providers/apollo/client/initApolloClient';


describe('ChangeProfileSettingsForm component', () => {

    const sampleUser: Partial<User> = {
        __typename: 'User',
        slug: 'sample-user',
        hidden: false,
    };

    beforeEach(() => {
        mockUseCurrentUserCachedData.mockReturnValue(sampleUser);
    });

    function initApolloTestCache(user = sampleUser) {
        const cache = initApolloCache();
        return cache.restore({
            [ cache.identify(user)! ]: user,
        });
    }

    function renderInMockContext(mocks?: ContextMocks) {
        return render(
            <MockContextProvider mocks={mocks}>
                <ChangeProfileSettingsForm />
            </MockContextProvider>,
        );
    }

    class ViewUnderTest {
        static get privateProfileCheckbox() {
            return screen.getByLabelText('t:user.settings.profileModeLabel', { selector: 'input' });
        }
        static get submitButton() {
            return screen.getByRole('button', { name: 't:user.settings.changeProfileSettings' });
        }
    }

    const mockResponseGenerator = {
        success: () => ({
            request: {
                query: ChangeProfileSettingsDocument,
                variables: {
                    hidden: true,
                } as ChangeProfileSettingsMutationVariables,
            },
            result: {
                data: {
                    changeProfileSettings: true,
                } as ChangeProfileSettingsMutation,
            },
        }),
    };

    it('should successfully change profile settings', async () => {
        const cache = initApolloTestCache();
        const mockResponse = mockResponseGenerator.success();
        renderInMockContext({ mockResponses: [ mockResponse ], apolloCache: cache });

        const userCacheRecordKey = cache.identify(sampleUser)!;

        // verify initial cache records
        expect(cache.extract()).toEqual({
            [ userCacheRecordKey ]: sampleUser,
        });

        expect(ViewUnderTest.privateProfileCheckbox).not.toBeChecked();
        userEvent.click(ViewUnderTest.privateProfileCheckbox);
        expect(ViewUnderTest.privateProfileCheckbox).toBeChecked();
        userEvent.click(ViewUnderTest.submitButton);

        // verify if toast is visible
        const toast = await screen.findByTestId('MockToast');
        expect(toast).toHaveClass('success');
        expect(toast).toHaveTextContent('t:user.settings.profileSettingsChangeSuccess');

        // verify updated cache
        expect(cache.extract()).toEqual({
            [ userCacheRecordKey ]: {
                ...sampleUser,
                hidden: true,
            },
            ROOT_MUTATION: expect.any(Object),
        });
    });

});
