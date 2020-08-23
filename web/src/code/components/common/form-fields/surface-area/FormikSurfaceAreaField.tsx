import React from 'react';
import { useField, useFormikContext } from 'formik';

import { SurfaceAreaField, SurfaceAreaFieldProps } from './SurfaceAreaField';
import { LabelWithOptionalIndicator } from '../LabelWithOptionalIndicator';


export interface FormikSurfaceAreaFieldProps extends Omit<SurfaceAreaFieldProps, 'variant' | 'onChange' | 'value'> {
    name: string;
    optional?: boolean;
    suggestedValue?: number | null;
}

export function FormikSurfaceAreaField({ name, label, optional, suggestedValue, ...rest }: FormikSurfaceAreaFieldProps): React.ReactElement {
    const { isSubmitting } = useFormikContext();
    const [ field, meta, { setValue } ] = useField<number | undefined>(name);
    const errorMessage = meta.touched ? meta.error : undefined;

    const prevSuggestedValue = React.useRef<number | null | undefined>(suggestedValue);
    React.useEffect(() => {
        if (suggestedValue !== prevSuggestedValue.current) {
            setValue(suggestedValue || undefined);
            prevSuggestedValue.current = suggestedValue;
        }
    }, [ suggestedValue, setValue ]);

    return (
        <SurfaceAreaField
            {...field}
            {...rest}
            onChange={setValue}


            id={rest.id || field.name}
            label={optional ? <LabelWithOptionalIndicator label={label} /> : label}
            disabled={rest.disabled || isSubmitting}
            error={Boolean(errorMessage)}
            helperText={errorMessage || rest.helperText}

            variant='filled'
            margin='normal'
            fullWidth
        />
    );
}
