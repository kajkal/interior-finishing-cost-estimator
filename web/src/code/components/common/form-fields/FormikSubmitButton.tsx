import React from 'react';
import { useFormikContext } from 'formik';

import Button, { ButtonProps } from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress/CircularProgress';


export interface FormikSubmitButtonProps extends ButtonProps {
}

/**
 * Form submit button with spinner.
 */
export function FormikSubmitButton({ children, disabled, ...rest }: FormikSubmitButtonProps): React.ReactElement {
    const { isSubmitting } = useFormikContext();
    return (
        <Button
            {...rest}
            disabled={disabled || isSubmitting}
            type={rest.type || 'submit'}
            variant='contained'
            color='primary'
        >
            {isSubmitting ? <CircularProgress color='inherit' size='26px' /> : children}
        </Button>
    );
}
