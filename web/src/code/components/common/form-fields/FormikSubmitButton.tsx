import React from 'react';
import clsx from 'clsx';
import { useFormikContext } from 'formik';

import { makeStyles } from '@material-ui/core/styles';
import Button, { ButtonProps } from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress/CircularProgress';


export interface FormikSubmitButtonProps extends ButtonProps {
    danger?: boolean;
}

/**
 * Form submit button with spinner.
 */
export function FormikSubmitButton({ children, disabled, danger, ...rest }: FormikSubmitButtonProps): React.ReactElement {
    const classes = useStyles();
    const { isSubmitting } = useFormikContext();
    return (
        <Button
            {...rest}
            disabled={disabled || isSubmitting}
            type={rest.type || 'submit'}
            variant='contained'
            color='primary'
            className={clsx(rest.className, {
                [ classes.danger ]: danger,
            })}
        >
            {isSubmitting ? <CircularProgress color='inherit' size='26px' /> : children}
        </Button>
    );
}

const useStyles = makeStyles((theme) => ({
    danger: {
        color: theme.palette.error.contrastText,
        backgroundColor: theme.palette.error.main,
        '&:hover': {
            backgroundColor: theme.palette.error.dark,
            // Reset on touch devices, it doesn't add specificity
            '@media (hover: none)': {
                backgroundColor: theme.palette.error.main,
            },
        },
    },
}));
