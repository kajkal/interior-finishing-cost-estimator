import React from 'react';
import { ApolloProvider } from '@apollo/react-hooks';

import { initApolloClient } from './client/initApolloClient';


export interface ApolloContextProviderProps {
    children: React.ReactNode;
}

export function ApolloContextProvider({ children }: ApolloContextProviderProps): React.ReactElement {
    const [ client ] = React.useState(() => initApolloClient({ sessionState: { accessToken: '' } }));
    return (
        <ApolloProvider client={client}>
            {children}
        </ApolloProvider>
    );
}
