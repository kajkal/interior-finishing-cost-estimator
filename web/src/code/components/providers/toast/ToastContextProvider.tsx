import React from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import { TransitionProps } from '@material-ui/core/transitions';
import Snackbar, { SnackbarCloseReason } from '@material-ui/core/Snackbar/Snackbar';
import Alert, { Color } from '@material-ui/lab/Alert';
import Slide from '@material-ui/core/Slide';

import { ToastContentProps, ToastContext, ToastContextData } from './context/ToastContext';
import { useSideNavController } from '../../atoms/side-nav/useSideNavController';


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
    const classes = useStyles();
    const { t } = useTranslation();
    const { isSideNavOpen } = useSideNavController();
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
                className={clsx(classes.snackbar, {
                    [ classes.snackbarShift ]: isSideNavOpen,
                })}
                key={state.toastKey}
                open={state.open}
                onClose={handleToastClose}
                autoHideDuration={state.autoHideDuration}
                TransitionComponent={SlideTransition}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <Alert
                    className={classes.alert}
                    classes={{
                        action: classes.alertAction,
                    }}
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

const useStyles = makeStyles((theme) => ({
    snackbar: {
        [ theme.breakpoints.up('sm') ]: {
            marginRight: 24,
            maxWidth: 600,
            left: theme.spacing(9) + 25,
            transition: theme.transitions.create([ 'left' ], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
        },
    },
    snackbarShift: {
        [ theme.breakpoints.up('sm') ]: {
            left: theme.sideNavDrawer.width + 25,
            transition: theme.transitions.create([ 'left' ], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
    },
    alert: {
        [ theme.breakpoints.down('sm') ]: {
            width: '100%',
        },
    },
    alertAction: {
        alignItems: 'flex-start',
    },
}));
