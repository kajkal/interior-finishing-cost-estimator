import React from 'react';
import clsx from 'clsx';
import { FilledTextFieldProps, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import TodayIcon from '@material-ui/icons/Today';


export interface DateFieldProps extends Omit<FilledTextFieldProps, 'variant' | 'type'> {
    // children: React.ReactNode;
}

export function DateField({ InputLabelProps, InputProps, ...rest }: DateFieldProps): React.ReactElement {
    const classes = useStyles();


    return (
        <TextField
            {...rest}

            InputLabelProps={{
                shrink: true,
                ...InputLabelProps,
            }}
            InputProps={{
                renderSuffix: () => <TodayIcon className={classes.calendarIcon} pointerEvents='none' />,
                disableUnderline: true,
                classes: {
                    input: clsx(classes.input, {
                        [classes.inputWithoutLabel]: !rest.label,
                    }),
                },
                ...InputProps,
            }}

            type='date'
            variant='filled'
        />
    );
}

const useStyles = makeStyles({
    input: {
        minWidth: 150,
        appearance: 'unset',
        '&::-webkit-calendar-picker-indicator': {
            opacity: 0,
        },
    },
    inputWithoutLabel: {
        padding: [ [ 12, 10 ] ] as unknown as number,
    },
    calendarIcon: {
        position: 'absolute',
        top: 0,
        right: 10,
        bottom: 0,
        margin: 'auto 0',
    },
});
