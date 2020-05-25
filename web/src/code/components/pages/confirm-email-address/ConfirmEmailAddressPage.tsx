import React from 'react';
import { decode } from 'jsonwebtoken';
import { ApolloError } from 'apollo-boost';
import { Redirect } from 'react-router-dom';

import { useConfirmEmailAddressMutation } from '../../../../graphql/generated-types';
import { BackdropSpinner } from '../../common/progress-indicators/BackdropSpinner';
import { useSearchParams } from '../../common/router/useSearchParams';
import { useSnackbar } from '../../snackbars/useSnackbar';
import { routes } from '../../../config/routes';


/**
 * Use valid email address confirmation token value from search params (?token=tokenValue).
 * If token is invalid (not a valid JWT) undefined is returned.
 */
function useValidatedEmailAddressConfirmationToken(): string | undefined {
    const searchParams = useSearchParams();
    const emailAddressConfirmationToken = searchParams.get('token') as string;
    return React.useMemo(() => {
        try {
            const jwtPayload = decode(emailAddressConfirmationToken);
            return jwtPayload?.sub && emailAddressConfirmationToken;
        } catch (error) {
            return undefined;
        }
    }, [ emailAddressConfirmationToken ]);
}

export function ConfirmEmailAddressPage(): React.ReactElement {
    const { infoSnackbar, successSnackbar, errorSnackbar } = useSnackbar();
    const [ confirmEmailAddressMutation, { data, error } ] = useConfirmEmailAddressMutation();
    const emailAddressConfirmationToken = useValidatedEmailAddressConfirmationToken();

    React.useEffect(() => {
        if (emailAddressConfirmationToken) {
            void async function confirmEmailAddress() {
                try {
                    await confirmEmailAddressMutation({
                        variables: { data: { token: emailAddressConfirmationToken } },
                    });
                    successSnackbar('Your email address has been confirmed');
                } catch (error) {
                    console.log('error :<', error);
                    if (error instanceof ApolloError) {
                        if (error.graphQLErrors) {
                            if (error.graphQLErrors[ 0 ]?.message === 'EMAIL_ADDRESS_ALREADY_CONFIRMED') {
                                infoSnackbar('This email has already been confirmed');
                            }
                        }
                        if (error.networkError) {
                            errorSnackbar('Network error');
                            console.error(error.networkError);
                        }
                    } else {
                        errorSnackbar('An unexpected error occurred');
                        console.error(error);
                    }
                }
            }();
        }
    }, []);

    if (emailAddressConfirmationToken && !data && !error) {
        return <BackdropSpinner />;
    }

    return <Redirect to={routes.login()} />;
}
