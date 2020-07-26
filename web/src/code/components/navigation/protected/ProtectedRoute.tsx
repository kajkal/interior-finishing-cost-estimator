import React from 'react';
import { RouteProps, useLocation } from 'react-router';
import { Navigate, Route } from 'react-router-dom';

import { useCurrentUserCachedData } from '../../../utils/hooks/useCurrentUserCachedData';
import { useToast } from '../../providers/toast/useToast';
import { nav } from '../../../config/nav';


export interface ProtectedRouteProps extends RouteProps {
    /**
     * Silent navigation, with replace, without warning toast
     */
    silent?: boolean;
}

export function ProtectedRoute({ silent, element, ...rest }: ProtectedRouteProps): React.ReactElement {
    const isUserLoggedIn = Boolean(useCurrentUserCachedData());
    const { warningToast } = useToast();
    const location = useLocation();

    React.useEffect(() => {
        if (!isUserLoggedIn && !silent) {
            warningToast(({ t }) => t('error.authorizationRequired'));
        }
    }, [ isUserLoggedIn, silent, warningToast ]);

    return (
        <Route
            {...rest}
            element={
                (isUserLoggedIn)
                    ? element
                    : <Navigate
                        to={nav.login()}
                        state={silent ? undefined : { from: location }}
                        replace={silent}
                    />
            }
        />
    );
}
