import React from 'react';
import { useField, useFormikContext } from 'formik';

import { LocationField, LocationFieldProps, LocationOption } from './LocationField';
import { LabelWithOptionalIndicator } from '../LabelWithOptionalIndicator';


export interface FormikLocationFieldProps extends Pick<LocationFieldProps, 'id' | 'label' | 'disabled' | 'helperText'> {
    name: string;
    optional?: boolean;
}

export function FormikLocationField({ name, label, optional, ...rest }: FormikLocationFieldProps): React.ReactElement {
    const { isSubmitting } = useFormikContext();
    const [ { onChange, ...field }, meta ] = useField<LocationOption | null>(name);
    const errorMessage = meta.touched ? meta.error : undefined;

    const handleChange = React.useCallback((value: LocationOption | null) => {
        onChange({ target: { name: name, value } });
    }, [ name, onChange ]);

    const fieldLabel = React.useMemo(() => (
        optional ? <LabelWithOptionalIndicator label={label} /> : label
    ), [ label, optional ]);

    return (
        <LocationField
            {...field}
            {...rest}
            onChange={handleChange}

            id={rest.id || field.name}
            label={fieldLabel}
            disabled={rest.disabled || isSubmitting}
            error={Boolean(errorMessage)}
            helperText={errorMessage || rest.helperText}
        />
    );
}
