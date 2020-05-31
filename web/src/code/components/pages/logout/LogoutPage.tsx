import React from 'react';
import { ApolloError } from 'apollo-boost';
import { Redirect } from 'react-router-dom';

import { useLogoutMutation } from '../../../../graphql/generated-types';
import { useSnackbar } from '../../providers/snackbars/useSnackbar';


export function LogoutPage(): React.ReactElement | null {
    const { successSnackbar, errorSnackbar } = useSnackbar();
    const [ logoutMutation, { data, client } ] = useLogoutMutation();

    React.useEffect(() => {
        void async function logout() {
            try {
                await logoutMutation();
                await client?.clearStore();
                successSnackbar('Logout successfully');
            } catch (error) {
                if (error instanceof ApolloError && error.networkError) {
                    errorSnackbar('Network error');
                    console.error(error.networkError);
                } else {
                    errorSnackbar('An unexpected error occurred');
                    console.error(error);
                }
            }
        }();
    }, []);

    if (data?.logout) {
        return <Redirect to='/login' />;
    }

    return null;
}
