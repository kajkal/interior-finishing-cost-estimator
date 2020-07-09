import React from 'react';

import { ApolloErrorHandler } from '../../providers/apollo/errors/ApolloErrorHandler';
import { useLogoutMutation } from '../../../../graphql/generated-types';
import { SessionChannel } from '../../../utils/communication/SessionChannel';
import { BackdropSpinner } from '../../common/progress-indicators/BackdropSpinner';
import { useToast } from '../../providers/toast/useToast';


export function LogoutPage(): React.ReactElement | null {
    const { errorToast } = useToast();
    const [ logoutMutation ] = useLogoutMutation();

    React.useEffect(() => {
        void async function logout() {
            try {
                await logoutMutation(); // invalidate refresh token cookie
                await SessionChannel.publishLogoutSessionAction(); // trigger session logout event
            } catch (error) {
                ApolloErrorHandler.process(error)
                    .handleNetworkError(() => errorToast(({ t }) => t('error.networkError')))
                    .finish();
            }
        }();
    }, []);

    return <BackdropSpinner invisible />;
}
