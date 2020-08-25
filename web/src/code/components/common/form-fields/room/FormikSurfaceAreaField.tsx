import React from 'react';
import { useField, useFormikContext } from 'formik';

import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';

import { LabelWithOptionalIndicator } from '../LabelWithOptionalIndicator';
import { FilledTextFieldProps } from '@material-ui/core/TextField';
import { NumberField } from '../number/NumberField';


export interface FormikSurfaceAreaFieldProps extends Omit<FilledTextFieldProps, 'variant' | 'onChange' | 'value'> {
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
        <NumberField
            {...field}
            {...rest}
            onChange={setValue}

            id={rest.id || field.name}
            label={optional ? <LabelWithOptionalIndicator label={label} /> : label}
            disabled={rest.disabled || isSubmitting}
            error={Boolean(errorMessage)}
            helperText={errorMessage || rest.helperText}

            InputProps={{
                endAdornment: (
                    <InputAdornment position='end'>
                        <Typography>
                            <span>m<sup>2</sup></span>
                        </Typography>
                    </InputAdornment>
                ),
            }}
            numberInputProps={{
                decimalScale: 1,
            }}

            variant='filled'
            margin='normal'
            fullWidth
        />
    );
}
