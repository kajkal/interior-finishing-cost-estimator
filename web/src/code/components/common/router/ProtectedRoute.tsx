import React from 'react';
import { RouteProps } from 'react-router';
import { Redirect, Route } from 'react-router-dom';

import { BackdropSpinner } from '../progress-indicators/BackdropSpinner';
import { useMeQuery } from '../../../../graphql/generated-types';
import { useToast } from '../../providers/toast/useToast';
import { routes } from '../../../config/routes';


export function ProtectedRoute({ children, ...rest }: RouteProps): React.ReactElement {
    const { warningToast } = useToast();
    const { error, loading } = useMeQuery();

    React.useEffect(() => {
        error && warningToast(({ t }) => t('error.authorizationRequired'));
    }, [ error, warningToast ]);

    return (
        <Route
            {...rest}
            render={({ location }) => {
                if (loading) {
                    return <BackdropSpinner />;
                }
                if (error) {
                    return <Redirect to={{ pathname: routes.login(), state: { from: location } }} />;
                }
                return children;
            }}
        />
    );
}
