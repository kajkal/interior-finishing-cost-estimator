import React from 'react';
import { InitialEntry } from 'history';
import { RecoilRoot, RecoilRootProps } from 'recoil/dist';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';

import { MockToastContextProvider } from './mocks/MockToastContextProvider';
import { MockRouter } from './context-providers/MockRouter';


export interface ContextMocks {
    recoilInitializeState?: RecoilRootProps['initializeState'];
    mockResponses?: ReadonlyArray<MockedResponse>;
    initialEntries?: InitialEntry[];
}

export interface MockContextProviderProps {
    children: React.ReactNode;
    mocks?: ContextMocks;
}

export function MockContextProvider({ children, mocks }: MockContextProviderProps): React.ReactElement {
    return (
        <RecoilRoot initializeState={mocks?.recoilInitializeState}>
            <MockedProvider mocks={mocks?.mockResponses || []}>
                <MockRouter initialEntries={mocks?.initialEntries}>
                    <MockToastContextProvider>
                        {children}
                    </MockToastContextProvider>
                </MockRouter>
            </MockedProvider>
        </RecoilRoot>
    );
}
