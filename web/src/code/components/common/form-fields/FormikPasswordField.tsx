import React from 'react';
import { useTranslation } from 'react-i18next';

import InputAdornment from '@material-ui/core/InputAdornment/InputAdornment';
import IconButton from '@material-ui/core/IconButton/IconButton';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Visibility from '@material-ui/icons/Visibility';

import { FormikTextField, FormikTextFieldProps } from './FormikTextField';


function preventDefault(event: React.MouseEvent) {
    event.preventDefault();
}

export function FormikPasswordField(props: FormikTextFieldProps): React.ReactElement {
    const { t } = useTranslation();
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
                            aria-label={t('form.password.toggleVisibility')}
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
