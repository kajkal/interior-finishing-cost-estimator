import React from 'react';
import { RecoilRoot } from 'recoil/dist';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { ThemeTypeSwitch } from '../../../../code/components/navigation/public/ThemeTypeSwitch';


describe('ThemeTypeSwitch component', () => {

    it('should render tooltip with action description when SideNav is collapsed', () => {
        const { rerender } = render(<ThemeTypeSwitch isSideNavOpen={false} />, { wrapper: RecoilRoot });
        expect(screen.getByRole('button')).toHaveAttribute('title', 't:common.switchToDarkTheme');

        rerender(<ThemeTypeSwitch isSideNavOpen={true} />);
        expect(screen.getByRole('button')).toHaveAttribute('title', '');
    });

    it('should switch to dark theme and then back to light theme', () => {
        render(<ThemeTypeSwitch isSideNavOpen={true} />, { wrapper: RecoilRoot });

        expect(screen.getByRole('button', { name: 't:common.switchToDarkTheme' })).toBeInTheDocument();
        userEvent.click(screen.getByRole('button'));
        expect(screen.getByRole('button', { name: 't:common.switchToLightTheme' })).toBeInTheDocument();
    });

});
