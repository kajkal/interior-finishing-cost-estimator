import React from 'react';
import { InitialEntry } from 'history';
import { ApolloCache } from '@apollo/client';
import { RecoilRoot, RecoilRootProps } from 'recoil/dist';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';

import { MockToastProvider } from './mocks/MockToastProvider';
import { MockRouter } from './context-providers/MockRouter';


export interface ContextMocks {
    recoilInitializeState?: RecoilRootProps['initializeState'];
    mockResponses?: ReadonlyArray<MockedResponse>;
    apolloCache?: ApolloCache<{}>;
    initialEntries?: InitialEntry[];
}

export interface MockContextProviderProps {
    children: React.ReactNode;
    mocks?: ContextMocks;
}

export function MockContextProvider({ children, mocks }: MockContextProviderProps): React.ReactElement {
    return (
        <RecoilRoot initializeState={mocks?.recoilInitializeState}>
            <MockedProvider mocks={mocks?.mockResponses || []} cache={mocks?.apolloCache}>
                <MockRouter initialEntries={mocks?.initialEntries}>
                    {children}
                    <MockToastProvider />
                </MockRouter>
            </MockedProvider>
        </RecoilRoot>
    );
}
