import React from 'react';
import { useRecoilValue } from 'recoil/dist';
import ThemeProvider from '@material-ui/styles/ThemeProvider';

import { saveThemeTypeAtomState, themeTypeAtom } from '../../atoms/theme-type/themeTypeAtom';
import { ThemeUtils } from '../../../utils/theme/ThemeUtils';


export interface DynamicThemeProvider {
    children: React.ReactNode;
}

export function DynamicThemeProvider({ children }: DynamicThemeProvider): React.ReactElement {
    const themeType = useRecoilValue(themeTypeAtom);

    React.useEffect(() => {
        saveThemeTypeAtomState(themeType);
    }, [ themeType ]);

    return (
        <ThemeProvider theme={ThemeUtils.themes[ themeType ]}>
            {children}
        </ThemeProvider>
    );
}
