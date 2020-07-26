import React from 'react';
import { render, screen } from '@testing-library/react';

import { mockUseCurrentUserCachedData } from '../../../__mocks__/code/mockUseCurrentUserCachedData';
import { mockUseSideNavController } from '../../../__mocks__/code/mockUseSideNavController';
import { ContextMocks, MockContextProvider } from '../../../__utils__/MockContextProvider';
import { mockComponent } from '../../../__utils__/mockComponent';

import { SideNav } from '../../../../code/components/navigation/SideNav';
import { nav } from '../../../../code/config/nav';


describe('SideNav component', () => {

    beforeAll(() => {
        mockComponent('../../code/components/navigation/public/ThemeTypeSwitch');
        mockComponent('../../code/components/navigation/public/LanguageMenu');
    });

    beforeEach(() => {
        mockUseSideNavController.mockReturnValue({ isSideNavOpen: false });
    });

    function renderInMockContext(mocks?: ContextMocks) {
        return render(
            <MockContextProvider mocks={mocks}>
                <SideNav />
            </MockContextProvider>,
        );
    }

    describe('with not logged in user', () => {

        beforeEach(() => {
            mockUseCurrentUserCachedData.mockReturnValue(undefined);
        });

        it('should render publicly available links', () => {
            renderInMockContext();

            const linkToInquiries = screen.getByRole('button', { name: 't:common.inquiriesAriaLabel' });
            const linkToLogin = screen.getByRole('button', { name: 't:loginPage.logIn' });
            const linkToSignup = screen.getByRole('button', { name: 't:signupPage.signUp' });

            // verify public navigation links
            expect(linkToInquiries).toBeVisible();
            expect(linkToInquiries).toHaveAttribute('href', nav.inquiries());
            expect(linkToLogin).toBeVisible();
            expect(linkToLogin).toHaveAttribute('href', nav.login());
            expect(linkToSignup).toBeVisible();
            expect(linkToSignup).toHaveAttribute('href', nav.signup());
        });

        it('should render common app settings buttons', () => {
            renderInMockContext();
            expect(screen.getByTestId('mock-ThemeTypeSwitch')).toBeVisible();
            expect(screen.getByTestId('mock-LanguageMenu')).toBeVisible();
        });

    });

    describe('with logged in user', () => {

        beforeEach(() => {
            mockUseCurrentUserCachedData.mockReturnValue({
                name: 'Sample Name',
                slug: 'sample-user',
                projects: [],
            });
        });

        it('should render links reserved only for authorized users', () => {
            renderInMockContext();

            const accountCollapsibleListToggle = screen.getByRole('button', { name: /^t:common.account(Expand|Collapse)$/ });
            const projectCollapsibleListToggle = screen.getByRole('button', { name: /^t:common.projects(Expand|Collapse)$/ });
            const linkToUserProducts = screen.getByRole('button', { name: 't:common.productsAriaLabel' });
            const linkToInquiries = screen.getByRole('button', { name: 't:common.inquiriesAriaLabel' });

            // verify public navigation links
            expect(accountCollapsibleListToggle).toBeVisible();
            expect(projectCollapsibleListToggle).toBeVisible();
            expect(linkToUserProducts).toBeVisible();
            expect(linkToUserProducts).toHaveAttribute('href', nav.products());
            expect(linkToInquiries).toBeVisible();
            expect(linkToInquiries).toHaveAttribute('href', nav.inquiries());
        });

        it('should render common app settings buttons', () => {
            renderInMockContext();
            expect(screen.getByTestId('mock-ThemeTypeSwitch')).toBeVisible();
            expect(screen.getByTestId('mock-LanguageMenu')).toBeVisible();
        });

    });

});
