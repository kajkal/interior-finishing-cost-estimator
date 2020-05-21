import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Backdrop from '@material-ui/core/Backdrop/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress/CircularProgress';


export function BackdropSpinner(): React.ReactElement {
    const classes = useStyles();
    return (
        <Backdrop className={classes.backdrop} open>
            <CircularProgress color='inherit' />
        </Backdrop>
    );
}

const useStyles = makeStyles((theme) => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
}));
