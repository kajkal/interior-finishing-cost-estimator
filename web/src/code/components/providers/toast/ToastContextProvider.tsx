import React from 'react';
import { useTranslation } from 'react-i18next';

import { TransitionProps } from '@material-ui/core/transitions';
import Snackbar, { SnackbarCloseReason } from '@material-ui/core/Snackbar/Snackbar';
import Alert, { Color } from '@material-ui/lab/Alert';
import Slide from '@material-ui/core/Slide';

import { ToastContentProps, ToastContext, ToastContextData } from './context/ToastContext';


export interface ToastContextProviderProps {
    children: React.ReactNode;
}

export interface ToastProviderState {
    open: boolean;
    severity: Color;
    toastKey: number;
    Toast: React.ComponentType<ToastContentProps>;
    autoHideDuration: number | null;
}

export function ToastContextProvider({ children }: ToastContextProviderProps): React.ReactElement {
    const { t } = useTranslation();
    const [ { Toast, ...state }, setState ] = React.useState<ToastProviderState>({
        open: false,
        toastKey: -1,
        severity: 'info',
        Toast: () => null,
        autoHideDuration: null,
    });

    const handleToastClose = React.useCallback((event: React.SyntheticEvent, reason?: SnackbarCloseReason) => {
        if (reason !== 'clickaway') {
            setState((prevState) => ({ ...prevState, open: false }));
        }
    }, []);

    const contextValue = React.useMemo<ToastContextData>(() => ({
        infoToast: (ToastContent, config) => {
            setState({
                open: true,
                severity: 'info',
                toastKey: Math.random(),
                Toast: ToastContent,
                autoHideDuration: config?.disableAutoHide ? null : 4000,
            });
        },
        successToast: (ToastContent, config) => {
            setState({
                open: true,
                severity: 'success',
                toastKey: Math.random(),
                Toast: ToastContent,
                autoHideDuration: config?.disableAutoHide ? null : 6000,
            });
        },
        warningToast: (ToastContent, config) => {
            setState({
                open: true,
                severity: 'warning',
                toastKey: Math.random(),
                Toast: ToastContent,
                autoHideDuration: config?.disableAutoHide ? null : 10000,
            });
        },
        errorToast: (ToastContent, config) => {
            setState({
                open: true,
                severity: 'error',
                toastKey: Math.random(),
                Toast: ToastContent,
                autoHideDuration: config?.disableAutoHide ? null : 15000,
            });
        },
    }), []);

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            <Snackbar
                key={state.toastKey}
                open={state.open}
                onClose={handleToastClose}
                autoHideDuration={state.autoHideDuration}
                TransitionComponent={SlideTransition}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
            >
                <Alert
                    onClose={handleToastClose}
                    severity={state.severity}
                    elevation={6}
                    variant='filled'
                    closeText={t('common.closeToast')}
                >
                    <Toast t={t} />
                </Alert>
            </Snackbar>
        </ToastContext.Provider>
    );
}

function SlideTransition(props: TransitionProps) {
    return <Slide {...props} direction='up' />;
}