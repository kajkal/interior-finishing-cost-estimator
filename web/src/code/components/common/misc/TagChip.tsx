import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Chip, { ChipProps } from '@material-ui/core/Chip';


export interface TagChipProps extends ChipProps {
}

export function TagChip({ ...rest }: TagChipProps): React.ReactElement {
    const classes = useStyles();
    return (
        <Chip
            size='small'
            variant='outlined'
            className={classes.tagChip}
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
