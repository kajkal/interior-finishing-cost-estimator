import React from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import CategoryIcon from '@material-ui/icons/Category';

import { InquiryDataFragment } from '../../../../graphql/generated-types';
import { categoryConfigMap } from '../../../config/supportedCategories';
import { findLowestQuote } from '../../../utils/mappers/inquiryMapper';
import { FormattedCurrencyAmount } from './FormattedCurrencyAmount';
import { TagChip } from './TagChip';


export interface InquiryPreviewProps extends React.HTMLAttributes<HTMLElement> {
    inquiry: InquiryDataFragment;
    component?: React.ElementType<React.HTMLAttributes<HTMLElement>>;
    titleRenderer?: () => React.ReactNode;
    isTagActive?: () => boolean;
}

export function InquiryPreview({ inquiry, component, titleRenderer, className, isTagActive, ...rest }: InquiryPreviewProps): React.ReactElement {
    const { t } = useTranslation();
    const classes = useStyles();
    const Container = component || DefaultContainer;
    const minQuote = findLowestQuote(inquiry);

    return (
        <Container className={clsx(classes.root, className)} {...rest}>
            <Typography className={classes.title}>
                {titleRenderer ? titleRenderer() : inquiry.title}
            </Typography>
            {(minQuote)
                ? <FormattedCurrencyAmount currencyAmount={minQuote.price} className={classes.price} />
                : (
                    <Typography variant='body2' className={classes.price}>
                        {t('inquiry.noOffers')}
                    </Typography>
                )}
            <div className={classes.tags}>
                <TagChip
                    icon={<CategoryIcon />}
                    label={t(categoryConfigMap[ inquiry.category ].tKey)}
                    color={isTagActive?.() ? 'primary' : 'default'}
                />
            </div>
        </Container>
    );
}

const DefaultContainer: React.ComponentType = ({ ...props}) => <Paper variant='outlined' {...props} />

const useStyles = makeStyles({
    root: {
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gridTemplateAreas: `
            'title price'
            'tags price'
        `,
    },
    title: {
        gridArea: 'title',
    },
    price: {
        gridArea: 'price',
    },
    tags: {
        gridArea: 'tags',
    },
});
