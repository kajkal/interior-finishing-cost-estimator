import React from 'react';
import Typography from '@material-ui/core/Typography';


export interface PageTitleProps {
    children: React.ReactNode;
}

export function PageTitle({ children }: PageTitleProps): React.ReactElement {
    return (
        <Typography variant='h2' gutterBottom>
            {children}
        </Typography>
    );
}
