import React from 'react';
import userEvent from '@testing-library/user-event';
import { getAllByRole, render, screen, waitForElementToBeRemoved } from '@testing-library/react';

import { mockTFunction, mockUseTranslation } from '../../../__mocks__/libraries/react-i18next';
import { LanguageMenu } from '../../../../code/components/navigation/public/LanguageMenu';


jest.mock('../../../../code/config/supportedLanguages', () => ({
    supportedLanguages: [
        { code: 'en', name: 'English' },
        { code: 'pl', name: 'Polski' },
        { code: 'de', name: 'Deutsch' },
    ],
}));

describe('LanguageMenu component', () => {

    const changeLanguageSpy = jest.fn();

    beforeEach(() => {
        changeLanguageSpy.mockClear();
        mockUseTranslation.mockClear();
        mockUseTranslation.mockImplementation(() => {
            const [ lng, setLng ] = React.useState('de');
            const handleLngChange = React.useCallback((newLng: string) => {
                setLng(newLng);
                changeLanguageSpy(newLng);
            }, [ setLng ]);
            return {
                t: mockTFunction,
                i18n: {
                    language: lng,
                    changeLanguage: handleLngChange,
                },
            };
        });
    });

    it('should render tooltip with action description when SideNav is collapsed', () => {
        const { rerender } = render(<LanguageMenu isSideNavOpen={false} />);
        expect(screen.getByRole('button')).toHaveAttribute('title', 't:common.changeLanguage');

        rerender(<LanguageMenu isSideNavOpen={true} />);
        expect(screen.getByRole('button')).toHaveAttribute('title', '');
    });

    it('should display available options and change language on option select', async () => {
        render(<LanguageMenu isSideNavOpen={false} />);

        const changeLanguageButton = screen.getByRole('button', { name: 't:common.changeLanguage' });
        expect(changeLanguageButton).toHaveTextContent('Deutsch');

        userEvent.click(changeLanguageButton);
        const languageMenu = screen.getByRole('menu');
        const languageOptions = getAllByRole(languageMenu, 'menuitem');
        expect(languageOptions).toHaveLength(3);
        expect(languageOptions[ 0 ]).toHaveTextContent('English');
        expect(languageOptions[ 1 ]).toHaveTextContent('Polski');
        expect(languageOptions[ 2 ]).toHaveTextContent('Deutsch');

        userEvent.click(languageOptions[ 1 ]);
        expect(changeLanguageSpy).toHaveBeenCalledTimes(1);
        expect(changeLanguageSpy).toHaveBeenCalledWith('pl');

        await waitForElementToBeRemoved(languageMenu);
        expect(changeLanguageButton).toHaveTextContent('Polski');
    });

});
