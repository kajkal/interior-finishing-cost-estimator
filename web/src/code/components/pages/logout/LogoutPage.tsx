import React from 'react';
import { useTranslation } from 'react-i18next';

import { ApolloErrorHandler } from '../../providers/apollo/errors/ApolloErrorHandler';
import { useLogoutMutation } from '../../../../graphql/generated-types';
import { useSnackbar } from '../../providers/snackbars/useSnackbar';
import { SessionChannel } from '../../../utils/communication/SessionChannel';
import { BackdropSpinner } from '../../common/progress-indicators/BackdropSpinner';


export function LogoutPage(): React.ReactElement | null {
    const { t } = useTranslation();
    const { errorSnackbar } = useSnackbar();
    const [ logoutMutation ] = useLogoutMutation();

    React.useEffect(() => {
        void async function logout() {
            try {
                await logoutMutation(); // invalidate refresh token cookie
                await SessionChannel.publishLogoutSessionAction(); // trigger session logout event
            } catch (error) {
                ApolloErrorHandler.process(error)
                    .handleNetworkError(() => errorSnackbar(t('error.networkError')))
                    .finish();
            }
        }();
    }, []);

    return <BackdropSpinner invisible />;
}
