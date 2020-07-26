import React from 'react';
import { ApolloClient, ApolloProvider } from '@apollo/client';

import { SessionAction, SessionChannel } from '../../../utils/communication/SessionChannel';
import { MeDocument, MeQuery } from '../../../../graphql/generated-types';
import { SessionActionType } from '../../../utils/communication/SessionActionType';
import { initApolloClient } from './client/initApolloClient';
import { AuthUtils } from '../../../utils/auth/AuthUtils';
import { accessTokenVar } from './client/accessTokenVar';


export interface ApolloContextProviderProps {
    children: React.ReactNode;
}

/**
 * This code is responsible for determining if there is already logged user on app startup.
 * If there is a logged user it also fetches initial app data.
 * Until all data is collected React.Suspense is triggered.
 */
const apolloClientResource = function createApolloClientWithCurrentUserContextResource() {
    const client = initApolloClient();
    let suspendedClient: ApolloClient<unknown> | undefined;

    const suspender = AuthUtils.refreshAccessToken()
        .then(async (token) => {
            accessTokenVar(token);
            try {
                await client.query<MeQuery>({ query: MeDocument });
            } catch {
                accessTokenVar(null);
            }
            suspendedClient = client;
        })
        .catch(_ => suspendedClient = client);

    return {
        read() {
            if (suspendedClient === undefined) {
                throw suspender;
            }
            return suspendedClient;
        },
    };
}();

export function ApolloContextProvider({ children }: ApolloContextProviderProps): React.ReactElement {
    const client = apolloClientResource.read();

    React.useEffect(() => {

        /**
         * Session state synchronizer - responsible for keeping session state in sync between tabs.
         * @param action - session action
         */
        async function sessionStateSynchronizer(action: SessionAction) {
            switch (action.type) {

                case SessionActionType.LOGIN:
                    client.writeQuery<MeQuery>({ query: MeDocument, data: { me: action.initialData.user } });
                    accessTokenVar(action.initialData.accessToken);
                    break;

                case SessionActionType.LOGOUT:
                    await client.clearStore();
                    break;

            }
        }

        SessionChannel.addSessionEventListener(sessionStateSynchronizer);
        return () => {
            SessionChannel.removeSessionEventListener(sessionStateSynchronizer);
        };
    }, [ client ]);

    return (
        <ApolloProvider client={client}>
            {children}
        </ApolloProvider>
    );
}
