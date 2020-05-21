import React from 'react';

import { TextFieldProps } from '@material-ui/core/TextField/TextField';
import InputAdornment from '@material-ui/core/InputAdornment/InputAdornment';
import IconButton from '@material-ui/core/IconButton/IconButton';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Visibility from '@material-ui/icons/Visibility';

import { FormikTextField } from './FormikTextField';


function preventDefault(event: React.MouseEvent) {
    event.preventDefault();
}

export function FormikPasswordField(props: TextFieldProps): React.ReactElement {
    const [ showPassword, setShowPassword ] = React.useState(false);

    const handleVisibilityIconClick = React.useCallback(() => {
        setShowPassword(visible => !visible);
    }, [ setShowPassword ]);

    return (
        <FormikTextField
            {...props}
            type={showPassword ? 'text' : 'password'}
            InputProps={{
                endAdornment: (
                    <InputAdornment position='end'>
                        <IconButton
                            aria-label='toggle password visibility'
                            onClick={handleVisibilityIconClick}
                            onMouseDown={preventDefault}
                        >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    );
}
