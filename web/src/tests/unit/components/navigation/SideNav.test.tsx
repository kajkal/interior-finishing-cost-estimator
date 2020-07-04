import React from 'react';
import { RecoilRoot } from 'recoil/dist';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import { SideNav } from '../../../../code/components/navigation/SideNav';


jest.mock('../../../../code/components/navigation/elements/ThemeTypeSwitch', () => ({
    ThemeTypeSwitch: () => <div data-testid='MockThemeTypeSwitch' />,
}));
jest.mock('../../../../code/components/navigation/elements/LanguageMenu', () => ({
    LanguageMenu: () => <div data-testid='MockLanguageMenu' />,
}));

describe('SideNav component', () => {

    const Wrapper: React.ComponentType = ({ children }) => (
        <RecoilRoot>
            <MemoryRouter>
                {children}
            </MemoryRouter>
        </RecoilRoot>
    );

    it('should render public navigation', () => {
        render(<SideNav />, { wrapper: Wrapper });

        expect(screen.getByTestId('MockThemeTypeSwitch')).toBeInTheDocument();
        expect(screen.getByTestId('MockLanguageMenu')).toBeInTheDocument();
    });

    it.todo('should render authenticated user\' navigation');

});
