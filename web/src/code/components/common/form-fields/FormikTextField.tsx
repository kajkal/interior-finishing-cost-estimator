import React from 'react';
import { Field } from 'formik';
import { FieldProps } from 'formik/dist/Field';
import TextField, { FilledTextFieldProps } from '@material-ui/core/TextField';
import { LabelWithOptionalIndicator } from './LabelWithOptionalIndicator';


export interface FormikTextFieldProps extends Omit<FilledTextFieldProps, 'variant'> {
    optional?: boolean;
}

export function FormikTextField({ name, label, optional, InputProps, ...rest }: FormikTextFieldProps): React.ReactElement {
    return (
        <Field name={name}>
            {({ field, form, meta }: FieldProps<string>) => {
                const errorMessage = meta.touched ? meta.error : undefined;
                return (
                    <TextField
                        {...rest}
                        {...field}

                        id={rest.id || field.name}
                        label={optional ? <LabelWithOptionalIndicator label={label} /> : label}
                        disabled={rest.disabled || form.isSubmitting}
                        error={Boolean(errorMessage)}
                        helperText={errorMessage || rest.helperText}
                        InputProps={{ ...InputProps, disableUnderline: true }}

                        variant='filled'
                        margin='normal'
                    />
                );
            }}
        </Field>
    );
}
