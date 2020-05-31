import React from 'react';
import Button, { ButtonProps } from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress/CircularProgress';


export interface ButtonWithSpinnerProps extends ButtonProps {
    isSpinning?: boolean;
}

/**
 * Form submit button with spinner.
 */
export function ButtonWithSpinner({ children, isSpinning, ...rest }: ButtonWithSpinnerProps): React.ReactElement {
    return (
        <Button
            {...rest}
            type='submit'
            variant='contained'
            color='primary'
        >
            {isSpinning ? <CircularProgress color='inherit' size='26px' /> : children}
        </Button>
    );
}
