import React from 'react';
import { HeadingElementProps } from '@udecode/slate-plugins';
import Typography from '@material-ui/core/Typography';


export function TitleElement({ attributes, children }: HeadingElementProps): React.ReactElement {
    return (
        <Typography component='h1' variant='h4' gutterBottom {...attributes}>{children}</Typography>
    );
}
