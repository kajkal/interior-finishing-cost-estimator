import React from 'react';
import { ApolloProvider } from '@apollo/react-hooks';
import ApolloClient, { InMemoryCache } from 'apollo-boost';

import { ApolloCacheManager, ApolloCacheShape } from './ApolloCacheManager';
import { AuthUtils } from './auth/AuthUtils';


export interface ApolloContextProviderProps {
    children: React.ReactNode;
}

const client = function initApolloClient() {
    const cache = new InMemoryCache();
    const client = new ApolloClient<ApolloCacheShape>({
        uri: `${process.env.REACT_APP_SERVER_URL}/graphql`,
        credentials: 'include',
        request: AuthUtils.prepareRequest,
        cache,
    });

    ApolloCacheManager.initLocalState(cache);
    client.onClearStore(async () => {
        ApolloCacheManager.initLocalState(cache);
    });

    return client;
}();

export function ApolloContextProvider({ children }: ApolloContextProviderProps): React.ReactElement {
    return (
        <ApolloProvider client={client}>
            {children}
        </ApolloProvider>
    );
}
