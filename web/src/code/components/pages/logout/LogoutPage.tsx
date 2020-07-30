import React from 'react';

import { usePageLinearProgressRevealer } from '../../common/progress-indicators/usePageLinearProgressRevealer';
import { ApolloErrorHandler } from '../../../utils/error-handling/ApolloErrorHandler';
import { useLogoutMutation } from '../../../../graphql/generated-types';
import { SessionChannel } from '../../../utils/communication/SessionChannel';
import { BackdropSpinner } from '../../common/progress-indicators/BackdropSpinner';
import { useToast } from '../../providers/toast/useToast';


export function LogoutPage(): React.ReactElement | null {
    const { errorToast } = useToast();
    const [ logoutMutation, { loading } ] = useLogoutMutation();
    usePageLinearProgressRevealer(loading);

    React.useEffect(() => {
        void async function logout() {
            try {
                await logoutMutation(); // invalidate refresh token cookie
                await SessionChannel.publishLogoutSessionAction(); // trigger session logout event
            } catch (error) {
                ApolloErrorHandler.process(error).verifyIfAllErrorsAreHandled();
            }
        }();
    }, [ errorToast, logoutMutation ]);

    return <BackdropSpinner invisible />;
}
