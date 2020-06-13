import React from 'react';
import { Redirect } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ApolloErrorHandler } from '../../providers/apollo/errors/ApolloErrorHandler';
import { useConfirmEmailAddressMutation } from '../../../../graphql/generated-types';
import { BackdropSpinner } from '../../common/progress-indicators/BackdropSpinner';
import { useVerifiedToken } from '../../../utils/hooks/useVerifiedToken';
import { useSearchParams } from '../../../utils/hooks/useSearchParams';
import { useSnackbar } from '../../providers/snackbars/useSnackbar';
import { routes } from '../../../config/routes';


export function ConfirmEmailAddressPage(): React.ReactElement {
    const { t } = useTranslation();
    const { infoSnackbar, successSnackbar, errorSnackbar } = useSnackbar();
    const [ confirmEmailAddressMutation, { data, error } ] = useConfirmEmailAddressMutation();
    const { token } = useSearchParams('token');
    const [ verifiedEmailAddressConfirmationToken ] = useVerifiedToken(token);

    React.useEffect(() => {
        if (verifiedEmailAddressConfirmationToken) {
            void async function confirmEmailAddress() {
                try {
                    await confirmEmailAddressMutation({
                        variables: { token: verifiedEmailAddressConfirmationToken },
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

    if (verifiedEmailAddressConfirmationToken && !data && !error) {
        return <BackdropSpinner />;
    }

    return <Redirect to={routes.login()} />;
}
