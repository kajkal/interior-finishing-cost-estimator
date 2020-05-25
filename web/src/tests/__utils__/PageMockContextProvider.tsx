import React from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory, MemoryHistory } from 'history';
import { MockedProvider, MockedResponse } from '@apollo/react-testing';

import { MockSnackbarContextData, MockSnackbarProvider } from './mocks/MockSnackbarProvider';


export interface PageContextMocks {
    history?: MemoryHistory;
    mocks?: ReadonlyArray<MockedResponse>;
    snackbarMocks?: MockSnackbarContextData;
}

export interface PageMockContextProviderProps {
    children: React.ReactNode;
    mocks?: PageContextMocks;
}

export function PageMockContextProvider(props: PageMockContextProviderProps): React.ReactElement {
    const { history = createMemoryHistory(), mocks = [], snackbarMocks } = props.mocks || {};
    return (
        <MockedProvider mocks={mocks}>
            <Router history={history}>
                <MockSnackbarProvider mocks={snackbarMocks}>
                    {props.children}
                </MockSnackbarProvider>
            </Router>
        </MockedProvider>
    );
}
