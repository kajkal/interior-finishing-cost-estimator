import React from 'react';
import clsx from 'clsx';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import { CurrencyAmount } from '../../../../graphql/generated-types';
import { formatAmount } from '../../../config/supportedCurrencies';


export interface FormattedCurrencyAmountProps extends React.HTMLProps<HTMLDivElement> {
    currencyAmount?: CurrencyAmount | null;
}

export const FormattedCurrencyAmount = React.forwardRef<HTMLDivElement, FormattedCurrencyAmountProps>(
    function FormattedCurrencyAmount({ currencyAmount, className, ...rest }: FormattedCurrencyAmountProps, ref): React.ReactElement {
        const classes = useStyles();

        return (
            <div className={clsx(classes.root, className)} ref={ref} {...rest}>
                {(currencyAmount)
                    ? (
                        <>
                            <Typography component='span'>
                                {formatAmount(currencyAmount)}
                            </Typography>
                            <Typography component='span' className={classes.currency} variant='caption'>
                                {currencyAmount.currency}
                            </Typography>
                        </>
                    )
                    : (
                        <Typography component='span' className={classes.missingCurrencyAmount}>-</Typography>
                    )}
            </div>
        );
    },
);

const useStyles = makeStyles({
    root: {
        display: 'flex',
    },
    currency: {
        verticalAlign: 'super',
        marginLeft: 5,
        width: 24,
    },
    missingCurrencyAmount: {
        marginRight: 29,
    },
});
