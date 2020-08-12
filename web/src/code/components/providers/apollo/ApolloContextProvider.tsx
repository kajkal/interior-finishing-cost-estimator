import React from 'react';
import { onError } from '@apollo/client/link/error';
import { ApolloClient, ApolloProvider } from '@apollo/client';

import { SessionAction, SessionChannel } from '../../../utils/communication/SessionChannel';
import { SessionActionType } from '../../../utils/communication/SessionActionType';
import { ErrorHandler } from '../../../utils/error-handling/ErrorHandler';
import { MeDocument, MeQuery } from '../../../../graphql/generated-types';
import { initApolloClient } from './client/initApolloClient';
import { AuthUtils } from '../../../utils/auth/AuthUtils';
import { accessTokenVar } from './client/accessTokenVar';
import { useToast } from '../toast/useToast';


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
    const { errorToast } = useToast();

    React.useEffect(() => {

        /**
         * Global error handling.
         */
        client.setLink(onError(({ networkError, graphQLErrors }) => {
            ErrorHandler.handleUnauthorizedError(networkError, () => {
                errorToast(({ t }) => t('error.sessionExpired'));
            });
            ErrorHandler.handleNetworkError(networkError, () => {
                errorToast(({ t }) => t('error.networkError'));
            });
            ErrorHandler.handleGraphQlError(graphQLErrors, 'USER_NOT_FOUND', () => {
                errorToast(({ t }) => t('user.userNotFoundError'));
            });
            ErrorHandler.handleGraphQlError(graphQLErrors, 'RESOURCE_OWNER_ROLE_REQUIRED', () => {
                errorToast(({ t }) => t('error.resourceOwnerRoleRequired'));
            });
            ErrorHandler.handleGraphQlError(graphQLErrors, 'PROJECT_NOT_FOUND', () => {
                errorToast(({ t }) => t('project.projectNotFoundError'));
            });
            ErrorHandler.handleGraphQlError(graphQLErrors, 'PRODUCT_NOT_FOUND', () => {
                errorToast(({ t }) => t('product.productNotFoundError'));
            });
        }).concat(client.link));

    }, [ client, errorToast ]);

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
