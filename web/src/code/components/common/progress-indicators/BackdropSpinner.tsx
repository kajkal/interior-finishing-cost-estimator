import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Backdrop, { BackdropProps } from '@material-ui/core/Backdrop/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress/CircularProgress';


export interface BackdropSpinnerProps extends BackdropProps {
}

export function BackdropSpinner(props: BackdropSpinnerProps): React.ReactElement {
    const classes = useStyles();
    return (
        <Backdrop {...props} className={classes.backdrop}>
            {!props.invisible && <CircularProgress color='inherit' />}
        </Backdrop>
    );
}

const useStyles = makeStyles((theme) => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
}));

BackdropSpinner.defaultProps = {
    open: true,
};
