import React from 'react';
import NumberFormat, { NumberFormatProps } from 'react-number-format';

import TextField, { FilledTextFieldProps } from '@material-ui/core/TextField';
import { InputBaseComponentProps } from '@material-ui/core/InputBase';


export interface NumberFieldProps extends Omit<FilledTextFieldProps, 'onChange' | 'value'> {
    value: number | undefined;
    onChange: (value: number | undefined) => void;
    numberInputProps?: Partial<NumberInputBaseProps>;
}

export function NumberField({ value, onChange, numberInputProps, InputProps, ...rest }: NumberFieldProps): React.ReactElement {
    const inputProps: NumberInputBaseProps = {
        onValueChange: ({ floatValue }) => onChange(floatValue),
        value: value ?? '',
        thousandSeparator: ' ',
        allowNegative: false,
        fixedDecimalScale: true,
        allowedDecimalSeparators: [ '.', ',' ],
        ...numberInputProps,
    };

    return (
        <TextField
            {...rest}
            InputProps={{
                disableUnderline: true,
                inputComponent: NumberInputBase as React.ComponentType<InputBaseComponentProps>,
                ...InputProps,
            }}
            inputProps={inputProps as InputBaseComponentProps}
        />
    );
}


interface NumberInputBaseProps extends Required<Pick<NumberFormatProps, 'value' | 'onValueChange'>>, Omit<NumberFormatProps, 'getInputRef'> {
}

/**
 * Props injected by InputBase from material-ui
 */
interface InjectedProps {
    inputRef: (instance: NumberFormat | null) => void;
}

function NumberInputBase({ inputRef, ...rest }: NumberInputBaseProps & InjectedProps): React.ReactElement {
    return (
        <NumberFormat getInputRef={inputRef} {...rest} />
    );
}
