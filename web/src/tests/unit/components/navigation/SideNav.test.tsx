import React from 'react';
import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';

import { mockUseSideNavController } from '../../../__mocks__/code/mockUseSideNavController';
import { mockUseSessionState } from '../../../__mocks__/code/mockUseSessionState';
import { ContextMocks, MockContextProvider } from '../../../__utils__/MockContextProvider';

import { SideNav } from '../../../../code/components/navigation/SideNav';
import { routes } from '../../../../code/config/routes';


jest.mock('../../../../code/components/navigation/elements/ThemeTypeSwitch', () => ({
    ThemeTypeSwitch: () => <div data-testid='MockThemeTypeSwitch' />,
}));
jest.mock('../../../../code/components/navigation/elements/LanguageMenu', () => ({
    LanguageMenu: () => <div data-testid='MockLanguageMenu' />,
}));

describe('SideNav component', () => {

    beforeEach(() => {
        mockUseSideNavController.mockReset();
        mockUseSessionState.mockReset();
    });

    function renderInMockContext(mocks?: ContextMocks) {
        return render(
            <MockContextProvider mocks={mocks}>
                <SideNav />
            </MockContextProvider>,
        );
    }

    it('should render publicly available navigation', () => {
        mockUseSideNavController.mockReturnValue({ isSideNavOpen: true });
        mockUseSessionState.mockReturnValue({ isUserLoggedIn: false });

        renderInMockContext({
            history: createMemoryHistory({ initialEntries: [ routes.login() ] }),
        });

        // verify active 'Log in' button
        const logInLink = screen.getByRole('button', { name: 'Log in' });
        expect(logInLink).toHaveAttribute('href', routes.login());
        expect(logInLink).toHaveAttribute('aria-current', 'page');
        expect(logInLink).toHaveAttribute('title', ''); // no tooltip

        // TODO: other links

        // verify common app settings buttons
        expect(screen.getByTestId('MockThemeTypeSwitch')).toBeInTheDocument();
        expect(screen.getByTestId('MockLanguageMenu')).toBeInTheDocument();
    });

    it('should render navigation available only for authenticated users', () => {
        mockUseSideNavController.mockReturnValue({ isSideNavOpen: false }); // tooltips should be active
        mockUseSessionState.mockReturnValue({ isUserLoggedIn: true });

        renderInMockContext({
            history: createMemoryHistory({ initialEntries: [ routes.projects() ] }),
        });

        // verify active 'Projects' button
        const projectsLink = screen.getByRole('button', { name: 'Projects' });
        expect(projectsLink).toHaveAttribute('href', routes.projects());
        expect(projectsLink).toHaveAttribute('aria-current', 'page');
        expect(projectsLink).toHaveAttribute('title', 'Projects'); // with tooltip

        // TODO: other links

        // verify common app settings buttons
        expect(screen.getByTestId('MockThemeTypeSwitch')).toBeInTheDocument();
        expect(screen.getByTestId('MockLanguageMenu')).toBeInTheDocument();
    });

});
