import React from 'react';

import TextField, { FilledTextFieldProps } from '@material-ui/core/TextField';
import { InputBaseComponentProps } from '@material-ui/core/InputBase';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';

import { NumberInputBase, NumberInputBaseProps } from '../number/NumberInputBase';


export interface SurfaceAreaFieldProps extends Omit<FilledTextFieldProps, 'onChange' | 'value'> {
    value: number | undefined;
    onChange: (value: number | undefined) => void;
}

export function SurfaceAreaField({ value, onChange, ...rest }: SurfaceAreaFieldProps): React.ReactElement {
    const numberInputProps: NumberInputBaseProps = {
        onValueChange: ({ floatValue: surfaceAreaValue }) => onChange(surfaceAreaValue),
        value: value ?? '',
        thousandSeparator: ' ',
        allowNegative: false,
        decimalScale: 1,
        fixedDecimalScale: true,
        allowedDecimalSeparators: [ '.', ',' ],
    };

    return (
        <TextField
            {...rest}
            InputProps={{
                disableUnderline: true,
                inputComponent: NumberInputBase as React.ComponentType<InputBaseComponentProps>,
                endAdornment: (
                    <InputAdornment position='end'>
                        <Typography>
                            <span>m<sup>2</sup></span>
                        </Typography>
                    </InputAdornment>
                ),
            }}
            inputProps={numberInputProps as InputBaseComponentProps}
        />
    );
}
