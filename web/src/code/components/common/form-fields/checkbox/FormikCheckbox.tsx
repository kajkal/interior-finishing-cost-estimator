import React from 'react';
import { Field, FieldProps } from 'formik';

import Checkbox, { CheckboxProps } from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';


export interface FormikCheckboxProps extends CheckboxProps {
    name: string;
    label: React.ReactNode;
}

export function FormikCheckbox({ name, label, ...rest }: FormikCheckboxProps): React.ReactElement {
    return (
        <Field name={name} type='checkbox'>
            {({ field, form }: FieldProps<boolean>) => (
                <FormControlLabel
                    control={
                        <Checkbox
                            {...field}
                            {...rest}
                            disabled={rest.disabled || form.isSubmitting}
                        />
                    }
                    label={label}
                />
            )}
        </Field>
    );
}
