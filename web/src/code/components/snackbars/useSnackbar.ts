import React from 'react';
import { SnackbarContext, SnackbarContextData } from './SnackbarContext';


export function useSnackbar(): SnackbarContextData {
    return React.useContext(SnackbarContext);
}
