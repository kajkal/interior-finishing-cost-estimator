import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

import { FormattedCurrencyAmount } from '../../../../common/misc/FormattedCurrencyAmount';
import { CurrencyAmount } from '../../../../../../graphql/generated-types';


export interface FormattedProductAmountProps {
    currencyAmount?: CurrencyAmount;
    quantity: number;
    className?: string;
}

export function FormattedProductAmount({ currencyAmount, quantity, className }: FormattedProductAmountProps): React.ReactElement {
    const classes = useStyles();
    const [ open, setOpen ] = React.useState(false);

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const handleToggle = () => {
        setOpen((prev) => !prev);
    };

    const tooltipContent = (quantity !== 1)
        ? (
            <div className={classes.contentContainer}>
                <FormattedCurrencyAmount
                    currencyAmount={{
                        currency: currencyAmount?.currency || '',
                        amount: currencyAmount?.amount || 0,
                    }}
                />
                <Typography className={classes.quantity}>{`x ${quantity}`}</Typography>
                <Divider className={classes.divider} />
                <FormattedCurrencyAmount
                    currencyAmount={{
                        currency: currencyAmount?.currency || '',
                        amount: (quantity * (currencyAmount?.amount || 0)) || 0,
                    }}
                />
            </div>
        )
        : '';

    return (
        <Tooltip
            title={tooltipContent}
            open={open}
            onClose={handleClose}
            onOpen={handleOpen}
            interactive
            leaveTouchDelay={5000}
        >
            <FormattedCurrencyAmount
                onClick={handleToggle}
                className={className}
                currencyAmount={currencyAmount && {
                    currency: currencyAmount.currency,
                    amount: (quantity * currencyAmount.amount),
                }}
            />
        </Tooltip>
    );
}

const useStyles = makeStyles((theme) => ({
    contentContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    quantity: {
        marginRight: 29,
    },
    divider: {
        backgroundColor: theme.palette.common.white,
        width: '100%',
    },
}));
