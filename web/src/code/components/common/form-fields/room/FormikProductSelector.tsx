import React from 'react';
import { useField, useFormikContext } from 'formik';

import { ProductAmountOption, ProductSelector, ProductSelectorProps } from './ProductSelector';
import { LabelWithOptionalIndicator } from '../LabelWithOptionalIndicator';


export interface FormikProductSelectorProps extends Pick<ProductSelectorProps, 'id' | 'label' | 'disabled' | 'helperText' | 'productOptions'> {
    name: string;
    productOptions: ProductAmountOption[];
}

export function FormikProductSelector({ name, label, ...rest }: FormikProductSelectorProps): React.ReactElement {
    const { isSubmitting } = useFormikContext();
    const [ { onChange, ...field }, meta ] = useField<ProductAmountOption[]>(name);
    const errorMessage = meta.touched ? parseProductSelectorErrors(meta.error) : undefined;

    const handleChange = React.useCallback((value: ProductAmountOption[]) => {
        onChange({ target: { name: name, value } });
    }, [ name, onChange ]);

    const fieldLabel = React.useMemo(() => (
        <LabelWithOptionalIndicator label={label} />
    ), [ label ]);

    return (
        <ProductSelector
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

type ProductSelectorError = Partial<Record<keyof ProductAmountOption, string>>;

function parseProductSelectorErrors(errors?: (ProductSelectorError | string)[] | string | undefined) {
    if (errors) return (typeof errors === 'string') ? errors : errors.map(parseProductSelectorError).find(Boolean);
}

function parseProductSelectorError(error?: ProductSelectorError | string | undefined) {
    if (error) return (typeof error === 'string') ? error : error.amount || error.product;
}

