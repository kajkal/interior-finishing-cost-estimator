import React from 'react';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel/InputLabel';
import Select, { SelectProps } from '@material-ui/core/Select';
import InputAdornment from '@material-ui/core/InputAdornment';
import MenuItem from '@material-ui/core/MenuItem';
import Input from '@material-ui/core/Input';


export interface CurrencySelectAdornmentProps extends Omit<SelectProps, 'value' | 'onChange'> {
    currencyOptions: string[];
    selectedCurrency: string;
    onCurrencyChange: (newCurrency: string) => void;
}

export function CurrencySelectAdornment({ currencyOptions, selectedCurrency, onCurrencyChange, ...rest }: CurrencySelectAdornmentProps): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();

    const handleChange: SelectProps['onChange'] = (event) => {
        (typeof event.target.value === 'string') && onCurrencyChange(event.target.value);
    };

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
                    currencyOptions.map((currency) => (
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
