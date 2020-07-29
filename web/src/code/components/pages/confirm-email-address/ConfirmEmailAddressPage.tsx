import React from 'react';
import { Navigate } from 'react-router-dom';

import { ApolloErrorHandler } from '../../../utils/error-handling/ApolloErrorHandler';
import { useConfirmEmailAddressMutation } from '../../../../graphql/generated-types';
import { BackdropSpinner } from '../../common/progress-indicators/BackdropSpinner';
import { useVerifiedToken } from '../../../utils/hooks/useVerifiedToken';
import { useSearchParams } from '../../../utils/hooks/useSearchParams';
import { useToast } from '../../providers/toast/useToast';
import { nav } from '../../../config/nav';


export function ConfirmEmailAddressPage(): React.ReactElement {
    const { token } = useSearchParams('token');
    const [ verifiedEmailAddressConfirmationToken ] = useVerifiedToken(token);
    const { infoToast, successToast, errorToast } = useToast();
    const [ confirmEmailAddressMutation, { data, error } ] = useConfirmEmailAddressMutation();

    React.useEffect(() => {
        if (verifiedEmailAddressConfirmationToken) {
            void async function confirmEmailAddress() {
                try {
                    await confirmEmailAddressMutation({
                        variables: { token: verifiedEmailAddressConfirmationToken },
                    });
                    successToast(({ t }) => t('emailConfirmationPage.emailConfirmedSuccessfully'));
                } catch (error) {
                    ApolloErrorHandler.process(error)
                        .handleGraphQlError('EMAIL_ADDRESS_ALREADY_CONFIRMED', () => {
                            infoToast(({ t }) => t('emailConfirmationPage.emailAlreadyConfirmed'));
                        })
                        .handleGraphQlError('INVALID_EMAIL_ADDRESS_CONFIRMATION_TOKEN', () => {
                            errorToast(({ t }) => t('emailConfirmationPage.invalidEmailConfirmationToken'));
                        })
                        .verifyIfAllErrorsAreHandled();
                }
            }();
        } else {
            errorToast(({ t }) => t('emailConfirmationPage.invalidEmailConfirmationToken'));
        }
    }, [ verifiedEmailAddressConfirmationToken, confirmEmailAddressMutation, successToast, infoToast, errorToast ]);

    if (verifiedEmailAddressConfirmationToken && !data && !error) {
        return <BackdropSpinner />;
    }

    return <Navigate to={nav.login()} />;
}
