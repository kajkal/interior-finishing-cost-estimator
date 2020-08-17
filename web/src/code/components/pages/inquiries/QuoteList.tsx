import React from 'react';
import clsx from 'clsx';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import { PriceQuoteDataFragment } from '../../../../graphql/generated-types';
import { FormattedCurrencyAmount } from '../../common/misc/FormattedCurrencyAmount';
import { RemoveQuoteButton } from './actions/RemoveQuoteButton';
import { UserChip } from '../../common/misc/UserChip';


export interface QuoteListProps {
    quotes?: PriceQuoteDataFragment[] | null;
    inquiryId: string;
    userSlug?: string;
    className: string;
}

export function QuoteList({ quotes, inquiryId, userSlug, className }: QuoteListProps): React.ReactElement {
    const classes = useStyles();
    const { t, i18n } = useTranslation();

    return (quotes && quotes.length)
        ? (
            <div className={clsx(classes.root, className)}>
                {quotes.map((quote, index) => (
                    <React.Fragment key={index}>
                        <Typography variant='body2'>
                            {DateTime.fromISO(quote.date).setLocale(i18n.language).toLocaleString(DateTime.DATETIME_MED)}
                        </Typography>
                        <UserChip user={quote.author} size='small' />
                        <FormattedCurrencyAmount currencyAmount={quote.price} />
                        <div>
                            {(userSlug === quote.author.userSlug) && (
                                <RemoveQuoteButton inquiryId={inquiryId} quoteDate={quote.date} />
                            )}
                        </div>
                    </React.Fragment>
                ))}
            </div>
        )
        : (
            <Typography variant='body2' className={className}>
                {t('inquiry.noOffers')}
            </Typography>
        );
}

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'grid',
        gridTemplateColumns: 'auto auto 1fr auto',
        gridAutoRows: 'auto',
        alignItems: 'center',
        justifyItems: 'start',
        gridGap: theme.spacing(1),
        gap: theme.spacing(1),
    },
}));
