import React from 'react';
import { ShowSnackbarFn, SnackbarContext } from '../../../code/components/snackbars/SnackbarContext';


export interface MockSnackbarContextData {
    infoSnackbar?: ShowSnackbarFn,
    successSnackbar?: ShowSnackbarFn,
    warningSnackbar?: ShowSnackbarFn,
    errorSnackbar?: ShowSnackbarFn,
}

export interface MockSnackbarContextProviderProps {
    children: React.ReactNode;
    mocks: MockSnackbarContextData | undefined;
}

export function MockSnackbarProvider({ children, mocks }: MockSnackbarContextProviderProps): React.ReactElement {
    return (
        <SnackbarContext.Provider value={{...createMockSnackbarContextData(), ...mocks}}>
            {children}
        </SnackbarContext.Provider>
    );
}

function createMockSnackbarContextData() {
    return {
        infoSnackbar: jest.fn(),
        successSnackbar: jest.fn(),
        warningSnackbar: jest.fn(),
        errorSnackbar: jest.fn(),
    }
}
