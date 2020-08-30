import React from 'react';
import clsx from 'clsx';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper, { PaperProps } from '@material-ui/core/Paper';

import { ProductDataFragment } from '../../../../graphql/generated-types';
import { TagChip } from './TagChip';


export interface ProductPreviewProps extends PaperProps {
    product: ProductDataFragment;
}

export function ProductPreview({ product, className, ...rest }: ProductPreviewProps): React.ReactElement {
    const classes = useStyles();
    return (
        <Paper variant='outlined' className={clsx(classes.productContainer, className)} {...rest}>
            <Typography>
                {product.name}
            </Typography>
            <div>
                {product.tags?.map((tag) => (
                    <TagChip key={tag} label={tag} />
                ))}
            </div>
        </Paper>
    );
}

const useStyles = makeStyles((theme) => ({
    productContainer: {
        padding: theme.spacing(1),
    },
}));
