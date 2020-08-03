import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';


export interface ToolbarProps {
    children: React.ReactNode;
    className?: string;
}

export function Toolbar({ children, className }: ToolbarProps): React.ReactElement {
    const classes = useStyles();
    return (
        <Paper elevation={0} className={clsx(classes.root, className || classes.defaultPosition)}>
            {children}
        </Paper>
    );
}

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        borderBottom: `1px solid ${theme.palette.text.disabled}`,
        position: 'sticky',
        backgroundColor: theme.palette.background.paper,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        zIndex: 2, // above checkbox
    },
    defaultPosition: {
        top: 56,
        [ `${theme.breakpoints.up('xs')} and (orientation: landscape)` ]: {
            top: 48,
        },
        [ theme.breakpoints.up('sm') ]: {
            top: 64,
        },
    },
}));
