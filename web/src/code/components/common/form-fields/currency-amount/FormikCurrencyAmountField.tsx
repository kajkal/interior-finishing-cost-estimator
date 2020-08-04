import React from 'react';
import { useField, useFormikContext } from 'formik';

import { CurrencyAmount, CurrencyAmountField, CurrencyAmountFieldProps } from './CurrencyAmountField';
import { LabelWithOptionalIndicator } from '../LabelWithOptionalIndicator';
import { supportedCurrencies } from '../../../../config/supportedCurrencies';


export interface FormikTextFieldProps extends Omit<CurrencyAmountFieldProps, 'variant' | 'onChange' | 'value' | 'currencies'> {
    name: string;
    optional?: boolean;
}

export function FormikCurrencyAmountField({ name, label, optional, ...rest }: FormikTextFieldProps): React.ReactElement {
    const { isSubmitting } = useFormikContext();
    const [ field, meta, { setValue } ] = useField<CurrencyAmount>(name);
    const errorMessage = meta.touched ? parseCurrencyAmountError(meta.error) : undefined;

    return (
        <CurrencyAmountField
            {...field}
            onChange={setValue}

            currencies={supportedCurrencies}

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

function parseCurrencyAmountError(error?: Partial<Record<keyof CurrencyAmount, string>> | string | undefined) {
    if (error) {
        return (typeof error === 'string') ? error : error.currency || error.amount;
    }
}
