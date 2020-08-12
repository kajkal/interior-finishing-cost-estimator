import React from 'react';
import { makeStyles } from '@material-ui/core/styles';


export interface PageHeaderProps {
    children: React.ReactNode;
}

export function PageHeader({ children }: PageHeaderProps): React.ReactElement {
    const classes = useStyles();
    return (
        <div className={classes.header}>
            {children}
        </div>
    );
}

const useStyles = makeStyles({
    header: {
        display: 'flex',
    },
});
