import React from 'react';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import { InputBaseComponentProps } from '@material-ui/core/InputBase';
import TextField, { FilledTextFieldProps } from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel/InputLabel';
import Select, { SelectProps } from '@material-ui/core/Select';
import InputAdornment from '@material-ui/core/InputAdornment';
import MenuItem from '@material-ui/core/MenuItem';
import Input from '@material-ui/core/Input';

import { NumberInputBase, NumberInputBaseProps } from '../number/NumberInputBase';
import { supportedCurrenciesInfoMap } from '../../../../config/supportedCurrencies';


export interface CurrencyAmount {
    currency: string;
    amount?: number;
}

export interface CurrencyAmountFieldProps extends Omit<FilledTextFieldProps, 'onChange' | 'value'> {
    value: CurrencyAmount;
    onChange: (value: CurrencyAmount) => void;
    currencies: string[];
}

export function CurrencyAmountField({ value, onChange, currencies, ...rest }: CurrencyAmountFieldProps): React.ReactElement {
    const numberInputProps: NumberInputBaseProps = {
        onValueChange: ({ floatValue: amount }) => onChange({ ...value, amount }),
        value: value.amount ?? '',
        thousandSeparator: ' ',
        allowNegative: false,
        decimalScale: supportedCurrenciesInfoMap.get(value.currency)?.decimalPlaces ?? 2,
        fixedDecimalScale: true,
    };

    return (
        <TextField
            {...rest}
            InputProps={{
                disableUnderline: true,
                inputComponent: NumberInputBase as React.ComponentType<InputBaseComponentProps>,
                endAdornment: (
                    <CurrencySelectAdornment
                        currencies={currencies}
                        selectedCurrency={value.currency}
                        onCurrencyChange={(currency) => onChange({ ...value, currency })}
                        disabled={rest.disabled}
                    />
                ),
            }}
            inputProps={numberInputProps as InputBaseComponentProps}
        />
    );
}


interface CurrencySelectAdornmentProps extends Omit<SelectProps, 'value' | 'onChange'> {
    currencies: string[];
    selectedCurrency: string;
    onCurrencyChange: (newCurrency: string) => void;
}

function CurrencySelectAdornment({ currencies, selectedCurrency, onCurrencyChange, ...rest }: CurrencySelectAdornmentProps): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();

    const handleChange: SelectProps['onChange'] = React.useCallback((event) => {
        (typeof event.target.value === 'string') && onCurrencyChange(event.target.value);
    }, [ onCurrencyChange ]);

    return (
        <InputAdornment position='end'>
            <InputLabel id='currency-select-label' className={classes.hiddenLabel}>
                {t('form.common.currencyAmount.currencySelectAriaLabel')}
            </InputLabel>
            <Select
                {...rest}
                labelId='currency-select-label'
                value={selectedCurrency}
                onChange={handleChange}
                input={<Input disableUnderline />}
                classes={{ select: classes.select }}
            >
                {
                    currencies.map((currency) => (
                        <MenuItem key={currency} value={currency}>{currency}</MenuItem>
                    ))
                }
            </Select>
        </InputAdornment>
    );
}

const useStyles = makeStyles({
    hiddenLabel: {
        display: 'none',
    },
    select: {
        paddingLeft: 7,
    },
});
