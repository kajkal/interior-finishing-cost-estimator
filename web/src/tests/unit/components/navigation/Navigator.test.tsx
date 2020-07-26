import React from 'react';
import { InitialEntry, State, To } from 'history';
import { NavigateFunction, useNavigate } from 'react-router';
import { act, render, screen } from '@testing-library/react';

import { MockContextProvider } from '../../../__utils__/MockContextProvider';
import { mockComponent } from '../../../__utils__/mockComponent';

import { Navigator } from '../../../../code/components/navigation/Navigator';
import { nav } from '../../../../code/config/nav';
import { accessTokenVar } from '../../../../code/components/providers/apollo/client/accessTokenVar';


describe('Navigator component', () => {

    beforeAll(() => {
        mockComponent('../../code/components/pages/login/LoginPage');
        mockComponent('../../code/components/pages/signup/SignupPage');
        mockComponent('../../code/components/pages/logout/LogoutPage');
        mockComponent('../../code/components/pages/confirm-email-address/ConfirmEmailAddressPage');
        mockComponent('../../code/components/pages/password-reset/PasswordResetRequestPage');
        mockComponent('../../code/components/pages/password-reset/PasswordResetPage');
        mockComponent('../../code/components/pages/inquiries/InquiriesPage');
        mockComponent('../../code/components/pages/profile/AuthorizedUserProfilePage');
        mockComponent('../../code/components/pages/settings/SettingsPage');
        mockComponent('../../code/components/pages/products/ProductsPage');
        mockComponent('../../code/components/pages/project/ProjectPage');
        mockComponent('../../code/components/pages/profile/UserProfilePage');
        mockComponent('../../code/components/pages/not-found/PageNotFound');
    });

    function renderInMockContext(initialEntries: InitialEntry[]) {
        let navigate!: NavigateFunction;
        const Handle = () => {
            navigate = useNavigate();
            return null;
        };
        const renderResult = render(
            <MockContextProvider mocks={{ initialEntries }}>
                <Navigator />
                <Handle />
            </MockContextProvider>,
        );
        return {
            ...renderResult,
            navigate: (to: To, options?: { replace?: boolean; state?: State }) => {
                act(() => navigate(to, options));
            },
        };
    }

    describe('with not logged in user', () => {

        beforeEach(() => {
            accessTokenVar(null);
        });

        it('should allow user to visit publicly available pages', () => {
            const { navigate } = renderInMockContext([ nav.login() ]);
            expect(screen.getByTestId('mock-LoginPage')).toBeInTheDocument();

            navigate(nav.signup());
            expect(screen.getByTestId('mock-SignupPage')).toBeInTheDocument();

            navigate(nav.confirmEmailAddress());
            expect(screen.getByTestId('mock-ConfirmEmailAddressPage')).toBeInTheDocument();

            navigate(nav.forgotPassword());
            expect(screen.getByTestId('mock-PasswordResetRequestPage')).toBeInTheDocument();

            navigate(nav.passwordReset());
            expect(screen.getByTestId('mock-PasswordResetPage')).toBeInTheDocument();

            navigate(nav.inquiries());
            expect(screen.getByTestId('mock-InquiriesPage')).toBeInTheDocument();

            navigate(nav.user('sample-user').profile());
            expect(screen.getByTestId('mock-UserProfilePage')).toBeInTheDocument();
        });

        it('should restrict access to protected pages for not logged in user', () => {
            const { navigate } = renderInMockContext([ nav.logout() ]);
            expect(screen.getByTestId('mock-LoginPage')).toBeInTheDocument();

            navigate(nav.profile());
            expect(screen.getByTestId('mock-LoginPage')).toBeInTheDocument();

            navigate(nav.settings());
            expect(screen.getByTestId('mock-LoginPage')).toBeInTheDocument();

            navigate(nav.products());
            expect(screen.getByTestId('mock-LoginPage')).toBeInTheDocument();

            navigate(nav.project('sample-project'));
            expect(screen.getByTestId('mock-LoginPage')).toBeInTheDocument();
        });

        it('should display page not found for invalid paths', () => {
            const { navigate } = renderInMockContext([ nav.home() ]);

            navigate('/sample-user/invalid-path');
            expect(screen.getByTestId('mock-PageNotFound')).toBeInTheDocument();

            navigate('/sample-user/projects');
            expect(screen.getByTestId('mock-PageNotFound')).toBeInTheDocument();

            navigate('/sample-user/projects');
            expect(screen.getByTestId('mock-PageNotFound')).toBeInTheDocument();
        });

    });

    describe('with logged in user', () => {

        beforeEach(() => {
            accessTokenVar('LOGGED_USER_TOKEN');
        });

        it('should allow user to visit protected pages when user is logged in', () => {
            const { navigate } = renderInMockContext([ nav.logout() ]);
            expect(screen.getByTestId('mock-LogoutPage')).toBeInTheDocument();

            navigate(nav.profile());
            expect(screen.getByTestId('mock-AuthorizedUserProfilePage')).toBeInTheDocument();

            navigate(nav.settings());
            expect(screen.getByTestId('mock-SettingsPage')).toBeInTheDocument();

            navigate(nav.products());
            expect(screen.getByTestId('mock-ProductsPage')).toBeInTheDocument();

            navigate(nav.project('sample-project'));
            expect(screen.getByTestId('mock-ProjectPage')).toBeInTheDocument();

            navigate('/sample-user/invalid-path');
            expect(screen.getByTestId('mock-PageNotFound')).toBeInTheDocument();
        });

    });

});
