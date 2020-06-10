import React from 'react';
import { decode } from 'jsonwebtoken';
import { Redirect } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ApolloErrorHandler } from '../../providers/apollo/errors/ApolloErrorHandler';
import { useConfirmEmailAddressMutation } from '../../../../graphql/generated-types';
import { BackdropSpinner } from '../../common/progress-indicators/BackdropSpinner';
import { useSearchParams } from '../../common/router/useSearchParams';
import { useSnackbar } from '../../providers/snackbars/useSnackbar';
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
    const { t } = useTranslation();
    const { infoSnackbar, successSnackbar, errorSnackbar } = useSnackbar();
    const [ confirmEmailAddressMutation, { data, error } ] = useConfirmEmailAddressMutation();
    const emailAddressConfirmationToken = useValidatedEmailAddressConfirmationToken();

    React.useEffect(() => {
        if (emailAddressConfirmationToken) {
            void async function confirmEmailAddress() {
                try {
                    await confirmEmailAddressMutation({
                        variables: { token: emailAddressConfirmationToken },
                    });
                    successSnackbar(t('emailConfirmationPage.emailConfirmedSuccessfully'));
                } catch (error) {
                    ApolloErrorHandler.process(error)
                        .handleNetworkError(() => errorSnackbar(t('error.networkError')))
                        .handleGraphQlErrors({
                            'EMAIL_ADDRESS_ALREADY_CONFIRMED': () => infoSnackbar(t('emailConfirmationPage.emailAlreadyConfirmed')),
                            'INVALID_EMAIL_ADDRESS_CONFIRMATION_TOKEN': () => errorSnackbar(t('emailConfirmationPage.invalidEmailConfirmationToken')),
                        })
                        .finish();
                }
            }();
        } else {
            errorSnackbar(t('emailConfirmationPage.invalidEmailConfirmationToken'));
        }
    }, []);

    if (emailAddressConfirmationToken && !data && !error) {
        return <BackdropSpinner />;
    }

    return <Redirect to={routes.login()} />;
}
