import React from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory, MemoryHistory } from 'history';
import { MockedProvider, MockedResponse } from '@apollo/react-testing';

import { MockSnackbarContextData, MockSnackbarProvider } from './mocks/MockSnackbarProvider';


export interface PageContextMocks {
    history?: MemoryHistory;
    mockResponses?: ReadonlyArray<MockedResponse>;
    mockSnackbars?: MockSnackbarContextData;
}

export interface PageMockContextProviderProps {
    children: React.ReactNode;
    mocks?: PageContextMocks;
}

export function PageMockContextProvider(props: PageMockContextProviderProps): React.ReactElement {
    const { history = createMemoryHistory(), mockResponses = [], mockSnackbars } = props.mocks || {};
    return (
        <MockedProvider mocks={mockResponses}>
            <Router history={history}>
                <MockSnackbarProvider mocks={mockSnackbars}>
                    {props.children}
                </MockSnackbarProvider>
            </Router>
        </MockedProvider>
    );
}
