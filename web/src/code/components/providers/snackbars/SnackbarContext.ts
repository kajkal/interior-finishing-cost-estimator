import React from 'react';


export type ShowSnackbarFn = (message: string) => void

export interface SnackbarContextData {
    infoSnackbar: ShowSnackbarFn,
    successSnackbar: ShowSnackbarFn,
    warningSnackbar: ShowSnackbarFn,
    errorSnackbar: ShowSnackbarFn,
}

const defaultSnackbarContextData: SnackbarContextData = {
    infoSnackbar: () => undefined,
    successSnackbar: () => undefined,
    warningSnackbar: () => undefined,
    errorSnackbar: () => undefined,
};

export const SnackbarContext = React.createContext(defaultSnackbarContextData);
