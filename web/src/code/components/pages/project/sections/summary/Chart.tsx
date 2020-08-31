import React from 'react';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import useResizeObserver from 'use-resize-observer';
import { Sunburst } from '@nivo/sunburst';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

import { FormattedCurrencyAmount } from '../../../../common/misc/FormattedCurrencyAmount';
import { findLowestQuote } from '../../../../../utils/mappers/inquiryMapper';
import { CurrencyAmount } from '../../../../../../graphql/generated-types';
import { CompleteRoom } from '../../../../../utils/mappers/projectMapper';


export interface ChartProps extends Omit<React.HTMLProps<HTMLDivElement>, 'ref'> {
    rooms: CompleteRoom[];
    totalAmount: CurrencyAmount;
}

export function Chart({ rooms, totalAmount, ...rest }: ChartProps): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const { ref, width = 1, height = 1 } = useResizeObserver<HTMLDivElement>();
    const data = React.useMemo(() => ({
        children: rooms.map((room) => mapRoomDataToChartData(room, totalAmount.currency, t)),
    }), [ rooms, totalAmount.currency, t ]);

    return (
        <div className={classes.relativeSquareContainer}>
            <Paper variant='outlined' className={classes.absoluteContainer} ref={ref} {...rest}>
                <div className={classes.chartTitle}>
                    <Typography>
                        {t('project.total')}
                    </Typography>
                    <FormattedCurrencyAmount currencyAmount={totalAmount} className={classes.totalAmount} />
                </div>
                <Sunburst
                    width={width}
                    height={height}
                    data={data}
                    margin={{ top: 64, right: 16, bottom: 20, left: 16 }}
                    identity='name'
                    value='cost'
                    cornerRadius={2}
                    borderWidth={1}
                    borderColor='white'
                    colors={{ scheme: 'nivo' }}
                    childColor={{ from: 'color', modifiers: [ [ 'brighter', 0.13 ] ] }}
                    animate={true}
                    motionStiffness={90}
                    motionDamping={15}
                    isInteractive={true}
                />
            </Paper>
        </div>
    );
}

function mapRoomDataToChartData(room: CompleteRoom, currency: string, t: TFunction) {
    return {
        id: room.id,
        name: room.name,
        children: [
            {
                id: 'projects',
                name: t('product.products'),
                children: room.products
                    .filter(({ product }) => product.price?.currency === currency)
                    .map(({ product, amount }) => ({
                        id: product.id,
                        name: product.name,
                        cost: product.price!.amount * amount,
                    })),
            },
            {
                id: 'inquiries',
                name: t('inquiry.inquiries'),
                children: room.inquiries
                    .map((inquiry) => ({
                        ...inquiry,
                        minQuote: findLowestQuote(inquiry),
                    }))
                    .filter(({ minQuote }) => minQuote?.price.currency === currency)
                    .map((inquiry) => ({
                        id: inquiry.id,
                        name: inquiry.title,
                        cost: inquiry.minQuote!.price.amount,
                    })),
            },
        ],
    };
}

const useStyles = makeStyles((theme) => ({
    relativeSquareContainer: {
        position: 'relative',
        paddingTop: '100%',
    },
    absoluteContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
    chartTitle: {
        position: 'absolute',
        top: 0,
        width: '100%',
        padding: theme.spacing(2.5, 1.5),
        display: 'flex',
        zIndex: 1,
    },
    totalAmount: {
        marginLeft: theme.spacing(1),
    },
}));
