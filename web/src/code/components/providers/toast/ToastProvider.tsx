import React from 'react';
import clsx from 'clsx';
import { useRecoilState } from 'recoil/dist';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import { TransitionProps } from '@material-ui/core/transitions';
import Snackbar, { SnackbarCloseReason } from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import Slide from '@material-ui/core/Slide';

import { useSideNavController } from '../../atoms/side-nav/useSideNavController';
import { toastAtom } from './atoms/toastAtom';


export function ToastProvider(): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const { isSideNavOpen } = useSideNavController();
    const [ { Toast, ...state }, setToastState ] = useRecoilState(toastAtom);

    const handleToastClose = React.useCallback((event: React.SyntheticEvent, reason?: SnackbarCloseReason) => {
        if (reason !== 'clickaway') {
            setToastState((prevState) => ({ ...prevState, open: false }));
        }
    }, [ setToastState ]);

    return (
        <Snackbar
            className={clsx(classes.snackbar, {
                [ classes.snackbarShift ]: isSideNavOpen,
            })}
            key={state.key}
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
