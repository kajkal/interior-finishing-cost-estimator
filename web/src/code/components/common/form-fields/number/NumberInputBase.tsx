import React from 'react';
import NumberFormat, { NumberFormatProps } from 'react-number-format';


export interface NumberInputBaseProps extends Required<Pick<NumberFormatProps, 'value' | 'onValueChange'>>, Omit<NumberFormatProps, 'getInputRef'> {
}

/**
 * Props injected by InputBase from material-ui
 */
interface InjectedProps {
    inputRef: (instance: NumberFormat | null) => void;
}

export function NumberInputBase({ inputRef, ...rest }: NumberInputBaseProps & InjectedProps): React.ReactElement {
    return (
        <NumberFormat getInputRef={inputRef} {...rest} />
    );
}
