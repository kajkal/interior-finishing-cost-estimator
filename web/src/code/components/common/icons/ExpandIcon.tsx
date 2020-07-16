import React from 'react';
import clsx from 'clsx';

import { makeStyles, Theme } from '@material-ui/core/styles';
import { SvgIconProps } from '@material-ui/core/SvgIcon';
import ExpandMore from '@material-ui/icons/ExpandMore';


export interface ExpandIconProps extends SvgIconProps {
    expanded: boolean;
}

export function ExpandIcon({ expanded, className, ...rest }: ExpandIconProps): React.ReactElement {
    const classes = useStyles();
    return (
        <ExpandMore
            {...rest}
            className={clsx(classes.root, className, {
                [ classes.expanded ]: expanded,
            })}
        />
    );
}

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        transition: theme.transitions.create([ 'transform', 'margin' ], {
            duration: theme.transitions.duration.standard,
        }),
    },
    expanded: {
        transform: 'scaleY(-1)',
    },
}));
