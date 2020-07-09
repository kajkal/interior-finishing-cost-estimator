import React from 'react';
import { Router } from 'react-router-dom';
import { RecoilRoot, RecoilRootProps } from 'recoil/dist';
import { createMemoryHistory, MemoryHistory } from 'history';
import { MockedProvider, MockedResponse } from '@apollo/react-testing';

import { MockToastContextProvider } from './mocks/MockToastContextProvider';


export interface ContextMocks {
    history?: MemoryHistory;
    mockResponses?: ReadonlyArray<MockedResponse>;
    mockRecoilInitializeState?: RecoilRootProps['initializeState'];
}

export interface MockContextProviderProps {
    children: React.ReactNode;
    mocks?: ContextMocks;
}

export function MockContextProvider(props: MockContextProviderProps): React.ReactElement {
    const { history = createMemoryHistory(), mockResponses = [], mockRecoilInitializeState } = props.mocks || {};
    return (
        <RecoilRoot initializeState={mockRecoilInitializeState}>
            <MockedProvider mocks={mockResponses}>
                <Router history={history}>
                    <MockToastContextProvider>
                        {props.children}
                    </MockToastContextProvider>
                </Router>
            </MockedProvider>
        </RecoilRoot>
    );
}
