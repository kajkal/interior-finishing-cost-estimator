import React from 'react';
import { useField, useFormikContext } from 'formik';

import { FilledTextFieldProps } from '@material-ui/core/TextField';

import { supportedCurrencies, supportedCurrenciesInfoMap } from '../../../../config/supportedCurrencies';
import { LabelWithOptionalIndicator } from '../LabelWithOptionalIndicator';
import { CurrencySelectAdornment } from './CurrencySelectAdornment';
import { NumberField } from '../number/NumberField';


export interface CurrencyAmount {
    currency: string;
    amount?: number;
}

export interface FormikCurrencyAmountFieldProps extends Omit<FilledTextFieldProps, 'onChange' | 'value' | 'variant'> {
    name: string;
    optional?: boolean;
}

export function FormikCurrencyAmountField({ name, label, optional, ...rest }: FormikCurrencyAmountFieldProps): React.ReactElement {
    const { isSubmitting } = useFormikContext();
    const [ { value, ...field }, meta, { setValue } ] = useField<CurrencyAmount>(name);
    const errorMessage = meta.touched ? parseCurrencyAmountError(meta.error) : undefined;

    return (
        <NumberField
            {...field}
            {...rest}
            value={value.amount}
            onChange={(amount) => setValue({ ...value, amount })}

            id={rest.id || field.name}
            label={optional ? <LabelWithOptionalIndicator label={label} /> : label}
            disabled={rest.disabled || isSubmitting}
            error={Boolean(errorMessage)}
            helperText={errorMessage || rest.helperText}

            InputProps={{
                endAdornment: (
                    <CurrencySelectAdornment
                        currencyOptions={supportedCurrencies}
                        selectedCurrency={value.currency}
                        onCurrencyChange={(currency) => setValue({ ...value, currency })}
                        disabled={rest.disabled || isSubmitting}
                    />
                ),
            }}
            numberInputProps={{
                decimalScale: supportedCurrenciesInfoMap.get(value.currency)?.decimalPlaces ?? 2,
            }}

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
