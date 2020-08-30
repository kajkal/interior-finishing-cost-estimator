import React from 'react';
import clsx from 'clsx';

import { makeStyles } from '@material-ui/core/styles';
import Chip, { ChipProps } from '@material-ui/core/Chip';


export interface TagChipProps extends ChipProps {
}

export function TagChip({ className, ...rest }: TagChipProps): React.ReactElement {
    const classes = useStyles();
    return (
        <Chip
            size='small'
            variant='outlined'
            className={clsx(classes.tagChip, className)}
            {...rest}
        />
    );
}

const useStyles = makeStyles({
    tagChip: {
        marginTop: 3,
        marginRight: 3,
    },
});
