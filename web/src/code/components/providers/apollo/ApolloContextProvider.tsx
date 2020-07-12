import React from 'react';
import { useHistory } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';

import { SessionAction, SessionChannel } from '../../../utils/communication/SessionChannel';
import { MeDocument, MeQuery, useMeLazyQuery } from '../../../../graphql/generated-types';
import { SessionActionType } from '../../../utils/communication/SessionActionType';
import { BackdropSpinner } from '../../common/progress-indicators/BackdropSpinner';
import { SessionStateUtils } from './cache/session/SessionStateUtils';
import { initApolloClient } from './client/initApolloClient';
import { AuthUtils } from '../../../utils/auth/AuthUtils';
import { routes } from '../../../config/routes';


export interface ApolloContextProviderProps {
    children: React.ReactNode;
}

/**
 * This code is responsible for determining if there is already logged user on app startup.
 * Until response from server is received React.Suspense is triggered.
 */
const accessTokenResource = function createAccessTokenResource() {
    let initialAccessToken: string | undefined;

    const suspender = AuthUtils.refreshAccessToken()
        .then(token => initialAccessToken = token) // user is already logged in
        .catch(_error => initialAccessToken = ''); // no valid refresh token - no logged user

    return {
        read() {
            if (initialAccessToken === undefined) {
                throw suspender;
            }
            return initialAccessToken;
        },
    };
}();

export function ApolloContextProvider({ children }: ApolloContextProviderProps): React.ReactElement {
    const accessToken = accessTokenResource.read(); // triggers React.Suspense
    const [ client ] = React.useState(() => initApolloClient({ sessionState: { accessToken } }));
    const [ meQuery, result ] = useMeLazyQuery({ client });
    const { push } = useHistory();

    React.useEffect(() => {

        /**
         * Session state synchronizer - responsible for keeping session state in sync between tabs.
         * @param action - session action
         */
        async function sessionStateSynchronizer(action: SessionAction) {
            switch (action.type) {

                case SessionActionType.LOGIN:
                    client.writeQuery<MeQuery>({ query: MeDocument, data: { me: action.initialData.user } });
                    SessionStateUtils.setSessionState(client, { accessToken: action.initialData.accessToken });
                    break;

                case SessionActionType.LOGOUT:
                    await client.clearStore();
                    push(routes.login());
                    break;

            }
        }

        SessionChannel.addSessionEventListener(sessionStateSynchronizer);
        return () => {
            SessionChannel.removeSessionEventListener(sessionStateSynchronizer);
        };
    }, [ client, push ]);

    React.useEffect(() => {
        accessToken && meQuery();
    }, [ accessToken ]);

    if (accessToken && (!result.data && !result.error)) {
        return <BackdropSpinner />;
    }
    return (
        <ApolloProvider client={client}>
            {children}
        </ApolloProvider>
    );
}
