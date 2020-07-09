import React from 'react';
import { Router } from 'react-router-dom';
import { RecoilRoot, RecoilRootProps } from 'recoil/dist';
import { createMemoryHistory, MemoryHistory } from 'history';
import { MockedProvider, MockedResponse } from '@apollo/react-testing';

import { MockSnackbarContextData, MockSnackbarProvider } from './mocks/MockSnackbarProvider';
import { MockToastContextProvider } from './mocks/MockToastContextProvider';


export interface ContextMocks {
    history?: MemoryHistory;
    mockResponses?: ReadonlyArray<MockedResponse>;
    mockSnackbars?: MockSnackbarContextData;
    mockRecoilInitializeState?: RecoilRootProps['initializeState'];
}

export interface MockContextProviderProps {
    children: React.ReactNode;
    mocks?: ContextMocks;
}

export function MockContextProvider(props: MockContextProviderProps): React.ReactElement {
    const { history = createMemoryHistory(), mockResponses = [], mockSnackbars, mockRecoilInitializeState } = props.mocks || {};
    return (
        <RecoilRoot initializeState={mockRecoilInitializeState}>
            <MockedProvider mocks={mockResponses}>
                <Router history={history}>
                    <MockToastContextProvider>
                        <MockSnackbarProvider mocks={mockSnackbars}>
                            {props.children}
                        </MockSnackbarProvider>
                    </MockToastContextProvider>
                </Router>
            </MockedProvider>
        </RecoilRoot>
    );
}
