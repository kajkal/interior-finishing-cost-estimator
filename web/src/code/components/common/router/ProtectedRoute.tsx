import React from 'react';
import { RouteProps, useLocation } from 'react-router';
import { Navigate, Route } from 'react-router-dom';

import { useToast } from '../../providers/toast/useToast';
import { nav } from '../../../config/nav';


export interface ProtectedRouteProps extends RouteProps {
    isUserLoggedIn: boolean;
    /**
     * Silent navigation, with replace, without warning toast
     */
    silent?: boolean;
}

export function ProtectedRoute({ isUserLoggedIn, silent, element, ...rest }: ProtectedRouteProps): React.ReactElement {
    const { warningToast } = useToast();
    const location = useLocation();

    React.useEffect(() => {
        if (!isUserLoggedIn && !silent) {
            warningToast(({ t }) => t('error.authorizationRequired'));
        }
    }, [ warningToast, isUserLoggedIn, silent ]);

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
