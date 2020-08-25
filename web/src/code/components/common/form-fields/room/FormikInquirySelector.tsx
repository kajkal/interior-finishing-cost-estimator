import React from 'react';
import { useField, useFormikContext } from 'formik';

import { InquiryOption, InquirySelector, InquirySelectorProps } from './InquirySelector';
import { LabelWithOptionalIndicator } from '../LabelWithOptionalIndicator';


export interface FormikInquirySelectorProps extends Pick<InquirySelectorProps, 'id' | 'label' | 'disabled' | 'helperText' | 'inquiryOptions'> {
    name: string;
    inquiryOptions: InquiryOption[];
}

export function FormikInquirySelector({ name, label, ...rest }: FormikInquirySelectorProps): React.ReactElement {
    const { isSubmitting } = useFormikContext();
    const [ { onChange, ...field }, meta ] = useField<InquiryOption[]>(name);
    const errorMessage = (meta.touched && meta.error) ? JSON.stringify(meta.error) : undefined;

    const handleChange = React.useCallback((value: InquiryOption[]) => {
        onChange({ target: { name: name, value } });
    }, [ name, onChange ]);

    const fieldLabel = React.useMemo(() => (
        <LabelWithOptionalIndicator label={label} />
    ), [ label ]);

    return (
        <InquirySelector
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
