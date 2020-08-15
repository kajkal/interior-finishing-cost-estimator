import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import TextField, { FilledTextFieldProps } from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';


export interface FilterSearchProps extends Pick<FilledTextFieldProps, 'value' | 'onChange' | 'className' | 'placeholder' | 'aria-label'> {
}

export function FilterSearch({ ...rest }: FilterSearchProps): React.ReactElement {
    const classes = useStyles();
    return (
        <TextField
            {...rest}

            InputProps={{
                disableUnderline: true,
                startAdornment: (
                    <InputAdornment position='start' style={{ marginTop: 'unset' }}>
                        <SearchIcon />
                    </InputAdornment>
                ),
                classes: {
                    input: classes.inputWithoutLabel,
                },
            }}

            type='search'
            variant='filled'
        />
    );
}

const useStyles = makeStyles({
    inputWithoutLabel: {
        padding: [ [ 12, 10 ] ] as unknown as number,
    },
});
