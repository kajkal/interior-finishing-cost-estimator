import React from 'react';
import { Field } from 'formik';
import { FieldProps } from 'formik/dist/Field';

import TextField, { TextFieldProps } from '@material-ui/core/TextField';


export function FormikTextField({ name, ...rest }: TextFieldProps): React.ReactElement {
    return (
        <Field name={name}>
            {({ field, form, meta }: FieldProps<string>) => {
                const errorMessage = meta.touched ? meta.error : undefined;
                return (
                    <TextField
                        {...rest}
                        {...field}

                        disabled={rest.disabled || form.isSubmitting}
                        error={Boolean(errorMessage)}
                        helperText={errorMessage || rest.helperText}

                        variant='outlined'
                        margin='normal'
                    />
                );
            }}
        </Field>
    );
}
