import React from 'react';
import { RouteProps } from 'react-router';
import { Redirect, Route } from 'react-router-dom';

import { BackdropSpinner } from '../progress-indicators/BackdropSpinner';
import { useSnackbar } from '../../providers/snackbars/useSnackbar';
import { useMeQuery } from '../../../../graphql/generated-types';
import { routes } from '../../../config/routes';


export function ProtectedRoute({ children, ...rest }: RouteProps): React.ReactElement {
    const { warningSnackbar } = useSnackbar();
    const { error, loading } = useMeQuery();

    React.useEffect(() => {
        error && warningSnackbar('Authorization required');
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
