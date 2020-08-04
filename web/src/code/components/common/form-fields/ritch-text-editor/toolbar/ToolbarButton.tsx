import React from 'react';
import clsx from 'clsx';

import { fade, makeStyles } from '@material-ui/core/styles';
import ButtonBase, { ButtonBaseProps } from '@material-ui/core/ButtonBase';
import Tooltip from '@material-ui/core/Tooltip';


export interface ToolbarButtonProps extends ButtonBaseProps {
    children: React.ReactNode;
    active?: boolean;
    label: string;
    shortcut?: string;
}

export function ToolbarButton(props: ToolbarButtonProps): React.ReactElement {
    const { active = false, disabled = false, children, label, shortcut, ...rest } = props;
    const classes = useStyles();

    return (
        <Tooltip arrow title={shortcut ? `${label} (${shortcut})` : label}>
            <div className={classes.tooltipAnchor}>
                <ButtonBase
                    className={clsx(classes.root, {
                        [ classes.disabled ]: disabled,
                        [ classes.active ]: active,
                    })}
                    disabled={disabled}
                    aria-pressed={active}
                    aria-label={label}
                    // focusRipple
                    tabIndex={-1} // toolbar buttons dont work on onClick/onKeyDown etc so no need to keep them keyboard accessible
                    {...rest}
                >
                    <span className={classes.label}>{children}</span>
                </ButtonBase>
            </div>
        </Tooltip>
    );
}

const useStyles = makeStyles((theme) => ({
    tooltipAnchor: {
        display: 'inline-block',
        margin: theme.spacing(0.5),
        '&:not(:first-child)': {
            marginLeft: 0,
        },
    },
    root: {
        ...theme.typography.button,
        borderRadius: theme.shape.borderRadius,
        padding: 7,
        fontSize: theme.typography.pxToRem(13),
        color: fade(theme.palette.action.active, 0.38),
        '&$active': {
            color: theme.palette.action.active,
            backgroundColor: fade(theme.palette.action.active, 0.12),
            '&:hover': {
                backgroundColor: fade(theme.palette.action.active, 0.15),
            },
        },
        '&$disabled': {
            color: fade(theme.palette.action.disabled, 0.12),
        },
        '&:hover': {
            textDecoration: 'none',
            backgroundColor: fade(theme.palette.text.primary, 0.05),
            '@media (hover: none)': {
                backgroundColor: 'transparent',
            },
            '&$disabled': {
                backgroundColor: 'transparent',
            },
        },
    },
    disabled: {},
    active: {},
    label: {
        width: '100%', // Ensure the correct width for iOS Safari
        display: 'inherit',
        alignItems: 'inherit',
        justifyContent: 'inherit',
    },
}));
