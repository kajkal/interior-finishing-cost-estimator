import React from 'react';
import clsx from 'clsx';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import { CurrencyAmount } from '../../../../graphql/generated-types';
import { formatAmount } from '../../../config/supportedCurrencies';


export interface FormattedCurrencyAmountProps {
    currencyAmount: CurrencyAmount;
    className?: string;
}

export function FormattedCurrencyAmount({ currencyAmount, className }: FormattedCurrencyAmountProps): React.ReactElement {
    const classes = useStyles();

    return (
        <div className={clsx(classes.root, className)}>
            <Typography>
                {formatAmount(currencyAmount)}
            </Typography>
            <Typography className={classes.currency} variant='caption'>
                {currencyAmount.currency}
            </Typography>
        </div>
    );
}

const useStyles = makeStyles({
    root: {
        display: 'flex',
    },
    currency: {
        verticalAlign: 'super',
        marginLeft: 5,
    },
});
