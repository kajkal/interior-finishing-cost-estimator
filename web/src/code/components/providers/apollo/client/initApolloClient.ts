import { ApolloClient, ApolloLink, from, InMemoryCache } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';
import { setContext } from '@apollo/link-context';


import { SessionStateUtils } from '../cache/session/SessionStateUtils';
import { ApolloCacheShape } from '../cache/ApolloCacheShape';
import { AuthUtils } from '../../../../utils/auth/AuthUtils';


export function initApolloClient(initialCacheState: ApolloCacheShape): ApolloClient<ApolloCacheShape> {
    const client = new ApolloClient({
        link: from([

            /**
             * Prepares GraphQL operation context before sending it as request to the server.
             * If operation is protected (require authorization) auth header is added.
             *
             * @throws will throw an error if cannot acquire valid access token (user is no longer authenticated).
             * Error thrown here could later be found in GraphQL operation result (error.networkError).
             */
            setContext(async (operation) => {
                console.log('%cprepareOperation', 'color: deepskyblue;', operation.operationName);

                if (AuthUtils.isProtectedOperation(operation.operationName)) {
                    const { accessToken } = SessionStateUtils.getSessionState(client);
                    const validAccessToken = AuthUtils.verifyAccessToken(accessToken) || await AuthUtils.refreshAccessToken();

                    if (accessToken !== validAccessToken) {
                        SessionStateUtils.setSessionState(client, { accessToken: validAccessToken });
                    }

                    return {
                        headers: {
                            authorization: `Bearer ${validAccessToken}`,
                        },
                    };
                }

                return {};
            }),

            createUploadLink({
                uri: `${process.env.REACT_APP_SERVER_URL}/graphql`,
                credentials: 'include',
            }) as unknown as ApolloLink,

        ]),
        cache: new InMemoryCache(),

    });

    SessionStateUtils.setSessionState(client, initialCacheState.sessionState);

    client.onClearStore(async () => {
        SessionStateUtils.setSessionState(client, SessionStateUtils.DEFAULT_SESSION_SATE);
    });

    return client;
}
