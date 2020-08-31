import React from 'react';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import { FormattedCurrencyAmount } from '../../../../common/misc/FormattedCurrencyAmount';
import { ConsciousRoomTypeIcon } from '../../../../common/icons/ConsciousRoomTypeIcon';
import { CompleteRoom } from '../../../../../utils/mappers/projectMapper';
import { Summary } from '../../../../../utils/mappers/roomMapper';


export interface SummaryRowProps extends Omit<React.HTMLProps<HTMLDivElement>, 'summary'> {
    room?: CompleteRoom;
    summary: Summary;
}

export function SummaryRow({ room, summary, ...rest }: SummaryRowProps): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <div {...rest}>
            {(room)
                ? (
                    <div className={classes.header}>
                        <ConsciousRoomTypeIcon
                            roomType={room.type}
                            className={classes.roomTypeIcon}
                            aria-hidden
                        />
                        <Typography>
                            {room.name}
                        </Typography>
                    </div>
                )
                : (
                    <div className={classes.header}>
                        <Typography>
                            {t('project.summary')}
                        </Typography>
                    </div>
                )}

            <div className={classes.summaryRow}>
                <Typography variant='body2' color='textSecondary' className={classes.summaryCaption}>
                    {t('product.products')}
                </Typography>
                <div className={classes.amounts}>
                    {(summary.product.length)
                        ? (summary.product.map((amount, index) => (
                            <FormattedCurrencyAmount key={index} currencyAmount={amount} />
                        )))
                        : <FormattedCurrencyAmount />}
                </div>
            </div>

            <div className={classes.summaryRow}>
                <Typography variant='body2' color='textSecondary' className={classes.summaryCaption}>
                    {t('inquiry.inquiries')}
                </Typography>
                <div className={classes.amounts}>
                    {(summary.inquiry.length)
                        ? (summary.inquiry.map((amount, index) => (
                            <FormattedCurrencyAmount key={index} currencyAmount={amount} />
                        )))
                        : <FormattedCurrencyAmount />}
                </div>
            </div>
        </div>
    );
}

const useStyles = makeStyles((theme) => ({
    header: {
        display: 'flex',
        alignItems: 'center',
    },
    summaryRow: {
        display: 'flex',
        marginLeft: theme.spacing(4.5),
    },
    summaryCaption: {
        marginTop: 2,
    },
    amounts: {
        display: 'flex',
        flexDirection: 'column',
        marginLeft: 'auto',
        alignItems: 'flex-end',
    },
    roomTypeIcon: {
        marginRight: theme.spacing(1.5),
    },
}));
