import React from 'react';
import clsx from 'clsx';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

import { ProductDataFragment } from '../../../../graphql/generated-types';
import { FormattedCurrencyAmount } from './FormattedCurrencyAmount';
import { TagChip } from './TagChip';


export interface ProductPreviewProps extends React.HTMLAttributes<HTMLElement> {
    product: ProductDataFragment;
    component?: React.ElementType<React.HTMLAttributes<HTMLElement>>;
    nameRenderer?: () => React.ReactNode;
    isTagActive?: (tag: string) => boolean;
}

export function ProductPreview({ product, component, nameRenderer, className, isTagActive, ...rest }: ProductPreviewProps): React.ReactElement {
    const classes = useStyles();
    const Container = component || DefaultContainer;

    return (
        <Container className={clsx(classes.root, className)} {...rest}>
            <Typography className={classes.name}>
                {nameRenderer ? nameRenderer() : product.name}
            </Typography>
            <FormattedCurrencyAmount currencyAmount={product.price} className={classes.price} />
            <div className={classes.tags}>
                {product.tags?.map((tag) => (
                    <TagChip
                        key={tag}
                        label={tag}
                        color={isTagActive?.(tag) ? 'primary' : 'default'}
                    />
                ))}
            </div>
        </Container>
    );
}

const DefaultContainer: React.ComponentType = ({ ...props }) => <Paper variant='outlined' {...props} />;

const useStyles = makeStyles({
    root: {
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gridTemplateAreas: `
            'name price'
            'tags price'
        `,
    },
    name: {
        gridArea: 'name',
    },
    price: {
        gridArea: 'price',
    },
    tags: {
        gridArea: 'tags',
    },
});
