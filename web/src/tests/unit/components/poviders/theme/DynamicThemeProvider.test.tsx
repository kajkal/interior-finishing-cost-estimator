import React from 'react';
import { RecoilRoot } from 'recoil/dist';
import { render, screen } from '@testing-library/react';
import { useTheme } from '@material-ui/core/styles';

import { DynamicThemeProvider } from '../../../../../code/components/providers/theme/DynamicThemeProvider';
import * as themeTypeAtom from '../../../../../code/components/atoms/theme-type/themeTypeAtom';


describe('DynamicThemeProvider component', () => {

    function SampleThemeConsumer() {
        const theme = useTheme();
        return <span data-testid='theme-type'>{theme.palette.type}</span>;
    }

    it('should provide theme', () => {
        jest.spyOn(themeTypeAtom, 'saveThemeTypeAtomState');

        render((
            <DynamicThemeProvider>
                <SampleThemeConsumer />
            </DynamicThemeProvider>
        ), { wrapper: RecoilRoot });

        expect(screen.getByTestId('theme-type')).toHaveTextContent('light');
        expect(themeTypeAtom.saveThemeTypeAtomState).toHaveBeenCalledTimes(1);
        expect(themeTypeAtom.saveThemeTypeAtomState).toHaveBeenCalledWith('light');
    });

});
