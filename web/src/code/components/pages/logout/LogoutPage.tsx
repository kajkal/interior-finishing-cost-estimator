import React from 'react';
import { ApolloError } from 'apollo-boost';
import { Redirect } from 'react-router-dom';

import { useLogoutMutation } from '../../../../graphql/generated-types';
import { useSnackbar } from '../../snackbars/useSnackbar';
import { authService } from '../../../services/auth/AuthService';


export function LogoutPage(): React.ReactElement | null {
    const { successSnackbar, errorSnackbar } = useSnackbar();
    const [ logoutMutation, { data, client } ] = useLogoutMutation();

    React.useEffect(() => {
        async function logout() {
            try {
                await logoutMutation();
                await client?.clearStore();
                authService.setAccessToken(undefined);
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
        }

        logout();
    }, []);

    if (data?.logout) {
        return <Redirect to='/login' />;
    }

    return null;
}
