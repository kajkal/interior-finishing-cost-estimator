import React from 'react';
import Alert, { Color } from '@material-ui/lab/Alert';
import Snackbar, { SnackbarCloseReason } from '@material-ui/core/Snackbar/Snackbar';

import { SnackbarContext } from './SnackbarContext';
import { snackbar } from '../../../config/snackbar';


export interface SnackbarProviderProps {
    children: React.ReactNode;
}

interface SnackbarConfig {
    open: boolean;
    autoHideDuration?: number;
    severity?: Color;
    message?: string;
}

export function SnackbarContextProvider(props: SnackbarProviderProps): React.ReactElement {
    const [ config, setConfig ] = React.useState<SnackbarConfig>({ open: false });

    const handleClose = React.useCallback((event: React.SyntheticEvent<any>, reason?: SnackbarCloseReason) => {
        if (reason !== 'clickaway') {
            setConfig(config => ({ ...config, open: false }));
        }
    }, []);

    const contextValue = React.useMemo(() => {
        return {
            infoSnackbar: (message: string) => setConfig({ open: true, message, ...snackbar.info }),
            successSnackbar: (message: string) => setConfig({ open: true, message, ...snackbar.success }),
            warningSnackbar: (message: string) => setConfig({ open: true, message, ...snackbar.waring }),
            errorSnackbar: (message: string) => setConfig({ open: true, message, ...snackbar.error }),
        };
    }, []);

    return (
        <SnackbarContext.Provider value={contextValue}>
            {props.children}
            <Snackbar
                open={config.open}
                onClose={handleClose}
                autoHideDuration={config.autoHideDuration}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <Alert onClose={handleClose} severity={config.severity} elevation={6} variant='filled'>
                    {config.message}
                </Alert>
            </Snackbar>
        </SnackbarContext.Provider>
    );
}
