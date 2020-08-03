import React from 'react';
import { HeadingElementProps } from '@udecode/slate-plugins';
import Typography from '@material-ui/core/Typography';


export function SubtitleElement({ attributes, children }: HeadingElementProps): React.ReactElement {
    return (
        <Typography component='h2' variant='h5' gutterBottom {...attributes}>{children}</Typography>
    );
}
