import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { MockRouter } from '../../../__utils__/mocks/MockRouter';

import { AccountCollapsibleList } from '../../../../code/components/navigation/protected/AccountCollapsibleList';
import { nav } from '../../../../code/config/nav';


describe('AccountCollapsibleList component', () => {

    const mockHandleSideNavToggle = jest.fn();

    beforeEach(() => {
        mockHandleSideNavToggle.mockReset();
    });

    it('should open SideNav and expand collapsible list on click when SideNav is initially closed', () => {
        const { rerender } = render(<AccountCollapsibleList
            isSideNavOpen={false}
            onSideNavToggle={mockHandleSideNavToggle}
            userName={'Sample Name'}
            avatarUrl={null}
        />, { wrapper: MockRouter });

        // simulate 'isSideNavOpen' prop change on 'onSideNavToggle' prop call
        mockHandleSideNavToggle.mockImplementation(() => {
            rerender(<AccountCollapsibleList
                isSideNavOpen={true}
                onSideNavToggle={mockHandleSideNavToggle}
                userName={'Sample Name'}
                avatarUrl={null}
            />);
        });

        const collapsibleListTrigger = screen.getByRole('button', { name: /^t:common.account(Expand|Collapse)$/ });

        // verify collapsed list trigger
        expect(collapsibleListTrigger).toHaveTextContent('Sample Name');
        expect(collapsibleListTrigger).toHaveAttribute('aria-label', 't:common.accountExpand');

        // expand list and open SideNav
        userEvent.click(collapsibleListTrigger);

        // verify if sidenav was triggered and collapsible list is expanded
        expect(mockHandleSideNavToggle).toHaveBeenCalledTimes(1);
        expect(collapsibleListTrigger).toHaveAttribute('aria-label', 't:common.accountCollapse');
    });

    it('should render tooltip with action description when SideNav is collapsed', () => {
        const { rerender } = render(<AccountCollapsibleList
            isSideNavOpen={false}
            onSideNavToggle={mockHandleSideNavToggle}
            userName={'Sample Name'}
            avatarUrl={null}
        />, { wrapper: MockRouter });

        const collapsibleListTrigger = screen.getByRole('button', { name: /^t:common.account(Expand|Collapse)$/ });
        expect(collapsibleListTrigger).toHaveAttribute('title', 't:common.accountExpand');

        rerender(<AccountCollapsibleList
            isSideNavOpen={true}
            onSideNavToggle={mockHandleSideNavToggle}
            userName={'Sample Name'}
            avatarUrl={null}
        />);
        expect(collapsibleListTrigger).toHaveAttribute('title', '');
    });

    it('should show user account options when account list is expanded and hide when is collapsed', async () => {
        render(<AccountCollapsibleList
            isSideNavOpen={true}
            onSideNavToggle={mockHandleSideNavToggle}
            userName={'Sample Name'}
            avatarUrl={null}
        />, { wrapper: MockRouter });

        const collapsibleListTrigger = screen.getByRole('button', { name: /^t:common.account(Expand|Collapse)$/ });
        const linkToProfile = screen.getByRole('button', { name: 't:common.profile' });
        const linkToSettings = screen.getByRole('button', { name: 't:common.settings' });
        const linkToLogout = screen.getByRole('button', { name: 't:common.logout' });

        // verify links
        expect(linkToProfile).toHaveAttribute('href', nav.profile());
        expect(linkToSettings).toHaveAttribute('href', nav.settings());
        expect(linkToLogout).toHaveAttribute('href', nav.logout());

        // verify if list is initially closed
        expect(screen.queryByRole('button', { name: 't:common.accountCollapse' })).toBeNull();
        expect(screen.queryByRole('button', { name: 't:common.accountExpand' })).toBeInTheDocument();

        // verify if links are invisible when list is collapsed
        expect(linkToProfile).not.toBeVisible();
        expect(linkToSettings).not.toBeVisible();
        expect(linkToLogout).not.toBeVisible();

        // toggle list
        userEvent.click(collapsibleListTrigger);

        // verify if links are visible when list is expanded
        await waitFor(() => expect(linkToProfile).toBeVisible());
        expect(linkToSettings).toBeVisible();
        expect(linkToLogout).toBeVisible();
    });

});
