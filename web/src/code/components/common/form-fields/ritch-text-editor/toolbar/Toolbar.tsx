import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';


export interface ToolbarProps {
    children: React.ReactNode;
}

export function Toolbar({ children }: ToolbarProps): React.ReactElement {
    const classes = useStyles();
    return (
        <Paper elevation={0} className={classes.root}>
            {children}
        </Paper>
    );
}

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',

        backgroundColor: theme.palette.background.paper,

        border: `1px solid ${theme.palette.text.disabled}`,
        borderBottomWidth: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
}));
