import React from 'react';
import clsx from 'clsx';

import ButtonBase, { ButtonBaseProps } from '@material-ui/core/ButtonBase';
import { makeStyles } from '@material-ui/core/styles';


export interface PaperButtonProps extends ButtonBaseProps, Pick<React.HTMLProps<HTMLAnchorElement>, 'rel' | 'target'> {
    children: React.ReactNode;
    contentClassName?: string;
    href?: string;
}

export function PaperButton({ children, className, contentClassName, ...rest }: PaperButtonProps): React.ReactElement {
    const classes = useStyles();
    return (
        <ButtonBase className={clsx(classes.papertButton, className)} {...rest}>
            <div className={clsx(classes.papertButtonContent, contentClassName)}>
                {children}
            </div>
        </ButtonBase>
    );
}

const useStyles = makeStyles((theme) => ({
    papertButton: {
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.palette.background.paper,
        transition: theme.transitions.create([ 'border' ], {
            duration: theme.transitions.duration.short,
        }),
        '&:hover': {
            border: `1px solid ${theme.palette.text.secondary}`,
        },
        '&:focus-within': {
            border: `1px solid ${theme.palette.primary.main}`,
        },
    },
    papertButtonContent: {
        borderRadius: 3,
        width: '100%',
        height: '100%',
    },
}));
