import React from 'react';
import { ParagraphElementProps } from '@udecode/slate-plugins';
import Typography from '@material-ui/core/Typography';


export function ParagraphElement({ attributes, children }: ParagraphElementProps): React.ReactElement {
    return (
        <Typography gutterBottom {...attributes} variant='body2'>{children}</Typography>
    );
}
