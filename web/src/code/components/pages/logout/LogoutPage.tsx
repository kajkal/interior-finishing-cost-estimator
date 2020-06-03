import React from 'react';
import { Redirect } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ApolloErrorHandler } from '../../providers/apollo/errors/ApolloErrorHandler';
import { useLogoutMutation } from '../../../../graphql/generated-types';
import { useSnackbar } from '../../providers/snackbars/useSnackbar';
import { routes } from '../../../config/routes';


export function LogoutPage(): React.ReactElement | null {
    const { t } = useTranslation();
    const { successSnackbar, errorSnackbar } = useSnackbar();
    const [ logoutMutation, { data, client } ] = useLogoutMutation();

    React.useEffect(() => {
        void async function logout() {
            try {
                await logoutMutation();
                await client?.clearStore();
                successSnackbar('Logout successfully'); // TODO remove
            } catch (error) {
                ApolloErrorHandler.process(error)
                    .handleNetworkError(() => errorSnackbar(t('error.networkError')))
                    .finish();
            }
        }();
    }, []);

    if (data?.logout) {
        return <Redirect to={routes.login()} />;
    }

    return null;
}
