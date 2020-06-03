import React from 'react';
import { RouteProps } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Redirect, Route } from 'react-router-dom';

import { BackdropSpinner } from '../progress-indicators/BackdropSpinner';
import { useSnackbar } from '../../providers/snackbars/useSnackbar';
import { useMeQuery } from '../../../../graphql/generated-types';
import { routes } from '../../../config/routes';


export function ProtectedRoute({ children, ...rest }: RouteProps): React.ReactElement {
    const { t } = useTranslation();
    const { warningSnackbar } = useSnackbar();
    const { error, loading } = useMeQuery();

    React.useEffect(() => {
        error && warningSnackbar(t('error.authorizationRequired'));
    }, [ error ]);

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
