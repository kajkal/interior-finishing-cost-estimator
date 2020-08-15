import React from 'react';
import { useField, useFormikContext } from 'formik';

import { CategoryField, CategoryFieldProps, CategoryOption } from './CategoryField';
import { LabelWithOptionalIndicator } from '../LabelWithOptionalIndicator';


export interface FormikCategoryFieldProps extends Pick<CategoryFieldProps, 'id' | 'label' | 'disabled' | 'helperText'> {
    name: string;
    optional?: boolean;
}

export function FormikCategoryField({ name, label, optional, ...rest }: FormikCategoryFieldProps): React.ReactElement {
    const { isSubmitting } = useFormikContext();
    const [ { onChange, ...field }, meta ] = useField<CategoryOption | null>(name);
    const errorMessage = meta.touched ? parseCategoryError(meta.error) : undefined;

    const handleChange = React.useCallback((value: CategoryOption | null) => {
        onChange({ target: { name: name, value } });
    }, [ name, onChange ]);

    const fieldLabel = React.useMemo(() => (
        optional ? <LabelWithOptionalIndicator label={label} /> : label
    ), [ label, optional ]);

    return (
        <CategoryField
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

type CategoryError = Partial<Record<keyof CategoryOption, string>>;

function parseCategoryError(error?: CategoryError | string | undefined): string | undefined {
    if (error) return (typeof error === 'string') ? error : error.id;
}
