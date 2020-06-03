import React from 'react';

import { BackdropSpinner } from '../../common/progress-indicators/BackdropSpinner';
import './i18n';


export interface I18nProviderProps {
    children: React.ReactNode;
}

export function I18nContextProvider({ children }: I18nProviderProps): React.ReactElement {
    return (
        <React.Suspense fallback={<BackdropSpinner />}>
            {children}
        </React.Suspense>
    );
}
