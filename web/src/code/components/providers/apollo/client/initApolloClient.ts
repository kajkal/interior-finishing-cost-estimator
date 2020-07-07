import ApolloClient, { Operation } from 'apollo-boost';

import { SessionStateUtils } from '../cache/session/SessionStateUtils';
import { ApolloCacheShape } from '../cache/ApolloCacheShape';
import { AuthUtils } from '../../../../utils/auth/AuthUtils';


export function initApolloClient(initialCacheState: ApolloCacheShape): ApolloClient<ApolloCacheShape> {
    const client = new ApolloClient<ApolloCacheShape>({
        uri: `${process.env.REACT_APP_SERVER_URL}/graphql`,
        credentials: 'include',
        resolvers: {}, // use @client with cache without using local resolvers

        /**
         * Prepares GraphQL operation context before sending it as request to the server.
         * If operation is protected (require authorization) auth header is added.
         *
         * @throws will throw an error if cannot acquire valid access token (user is no longer authenticated).
         * Error thrown here could later be found in GraphQL operation result (error.networkError).
         */
        request: async function prepareRequest(operation: Operation): Promise<void> {
            console.log('%cprepareRequest', 'color: deepskyblue;', operation.operationName);

            if (AuthUtils.isProtectedOperation(operation.operationName)) {
                const { accessToken } = SessionStateUtils.getSessionState(client);
                const validAccessToken = AuthUtils.verifyAccessToken(accessToken) || await AuthUtils.refreshAccessToken();

                if (accessToken !== validAccessToken) {
                    SessionStateUtils.setSessionState(client, { accessToken: validAccessToken });
                }

                operation.setContext({
                    headers: {
                        authorization: `Bearer ${validAccessToken}`,
                    },
                });
            }
        },
    });

    SessionStateUtils.setSessionState(client, initialCacheState.sessionState);

    client.onClearStore(async () => {
        SessionStateUtils.setDefaultSessionState(client);
    });

    return client;
}
