import React from 'react';
import { render, screen } from '@testing-library/react';

import { mockUseCurrentUserCachedData } from '../../../__mocks__/code/mockUseCurrentUserCachedData';
import { ContextMocks, MockContextProvider } from '../../../__utils__/mocks/MockContextProvider';
import { generator } from '../../../__utils__/generator';

import { SettingsPage } from '../../../../code/components/pages/settings/SettingsPage';


describe('SettingsPage component', () => {

    const sampleUser = generator.user({
        email: 'sample-email@domain.com',
        isEmailAddressConfirmed: false,
        hidden: false,
    });

    beforeEach(() => {
        mockUseCurrentUserCachedData.mockReturnValue(sampleUser);
    });

    function renderInMockContext(mocks?: ContextMocks) {
        return render(
            <MockContextProvider mocks={mocks}>
                <SettingsPage />
            </MockContextProvider>,
        );
    }

    it('should render settings page', async () => {
        renderInMockContext();

        // verify if 'change email' section is visible
        const changeEmailButtons = screen.getAllByRole('button', { name: 't:user.settings.changeEmail' });
        expect(changeEmailButtons).toHaveLength(2);
        expect(changeEmailButtons[ 0 ]).toBeVisible();
        expect(changeEmailButtons[ 0 ]).toHaveAttribute('aria-expanded', 'true');

        // verify if 'change password' section is visible
        const changePasswordButtons = screen.getAllByRole('button', { name: 't:user.settings.changePassword' });
        expect(changePasswordButtons).toHaveLength(2);
        expect(changePasswordButtons[ 0 ]).toBeVisible();
        expect(changePasswordButtons[ 0 ]).toHaveAttribute('aria-expanded', 'true');

        // verify if 'change profile settings' section is visible
        const changeProfileSettingsButtons = screen.getAllByRole('button', { name: 't:user.settings.changeProfileSettings' });
        expect(changeProfileSettingsButtons).toHaveLength(2);
        expect(changeProfileSettingsButtons[ 0 ]).toBeVisible();
        expect(changeProfileSettingsButtons[ 0 ]).toHaveAttribute('aria-expanded', 'true');
    });

});
