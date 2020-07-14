import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { mockTFunction, mockUseTranslation } from '../../../../__mocks__/libraries/react-i18next';
import { LanguageMenu } from '../../../../../code/components/navigation/public/LanguageMenu';


jest.mock('../../../../../code/config/supportedLanguages', () => ({
    supportedLanguages: [
        { code: 'en', name: 'English' },
        { code: 'pl', name: 'Polski' },
        { code: 'de', name: 'Deutsch' },
    ],
}));

describe('LanguageMenu component', () => {

    const mockChangeLanguage = jest.fn();

    beforeEach(() => {
        mockUseTranslation.mockClear();
        mockUseTranslation.mockReturnValue({
            t: mockTFunction,
            i18n: {
                language: 'de',
                changeLanguage: mockChangeLanguage,
            },
        });
    });

    it('should render tooltip with action description when SideNav is collapsed', () => {
        const { rerender } = render(<LanguageMenu isSideNavOpen={false} />);
        expect(screen.getByRole('button')).toHaveAttribute('title', 't:common.changeLanguage');

        rerender(<LanguageMenu isSideNavOpen={true} />);
        expect(screen.getByRole('button')).toHaveAttribute('title', '');
    });

    it('should display available options and change language on option select', async () => {
        render(<LanguageMenu isSideNavOpen={true} />);

        const triggerLanguageMenuButton = screen.getByRole('button', { name: 't:common.changeLanguage' });
        expect(triggerLanguageMenuButton).toHaveTextContent('Deutsch');

        userEvent.click(triggerLanguageMenuButton);
        userEvent.click(screen.getByRole('menuitem', { name: 'Polski' }));

        expect(mockChangeLanguage).toHaveBeenCalledTimes(1);
        expect(mockChangeLanguage).toHaveBeenCalledWith('pl');

        await waitFor(() => expect(screen.queryByRole('menu')).toBe(null));
    });

});
