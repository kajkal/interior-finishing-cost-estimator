import React from 'react';
import { makeStyles } from '@material-ui/core/styles';


export interface PageActionsProps {
    children: React.ReactNode;
}

export function PageActions({ children }: PageActionsProps): React.ReactElement {
    const classes = useStyles();
    return (
        <div className={classes.headerActions}>
            {children}
        </div>
    );
}

const useStyles = makeStyles({
    headerActions: {
        marginLeft: 'auto',
        display: 'flex',
        flexShrink: 0,
        alignItems: 'flex-start',
    },
});
