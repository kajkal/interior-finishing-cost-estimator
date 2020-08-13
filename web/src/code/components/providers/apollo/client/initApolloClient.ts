import { ApolloClient, ApolloLink, from, InMemoryCache } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';
import { setContext } from '@apollo/link-context';

import { AuthUtils } from '../../../../utils/auth/AuthUtils';
import { accessTokenVar } from './accessTokenVar';


export function initApolloClient(): ApolloClient<unknown> {
    const client = new ApolloClient({
        link: from([

            /**
             * onError link is added programmatically later.
             * @see ApolloContextProvider
             */

            /**
             * Prepares GraphQL operation context before sending it as request to the server.
             * If operation is protected (require authorization) auth header is added.
             *
             * @throws will throw an error if cannot acquire valid access token (user is no longer authenticated).
             * Error thrown here could later be found in GraphQL operation result (error.networkError).
             */
            setContext(async (operation, prevContext) => {
                const { headers = {}, forceAuth } = prevContext;
                console.log('%cprepareOperation', 'color: deepskyblue;', operation.operationName);

                if (AuthUtils.isProtectedOperation(operation.operationName) || forceAuth) {
                    const validAccessToken = AuthUtils.verifyAccessToken(accessTokenVar()) || await AuthUtils.refreshAccessToken();
                    accessTokenVar(validAccessToken);

                    return {
                        headers: {
                            authorization: `Bearer ${validAccessToken}`,
                            ...headers,
                        },
                    };
                }

                return headers;
            }),

            createUploadLink({
                uri: `${process.env.REACT_APP_SERVER_URL}/graphql`,
                credentials: 'include',
            }) as unknown as ApolloLink,

        ]),
        cache: initApolloCache(),
        resolvers: {},
    });

    client.onClearStore(async () => {
        accessTokenVar(null);
    });

    return client;
}

/**
 * Exported for sake of testing
 */
export function initApolloCache() {
    return new InMemoryCache({
        typePolicies: {
            User: {
                keyFields: [ 'slug' ],
            },
            Project: {
                keyFields: [ 'slug' ],
            },
            Profile: {
                keyFields: [ 'userSlug' ],
            },
        },
    });
}
