import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSetRecoilState } from 'recoil/dist';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import AddIcon from '@material-ui/icons/Add';

import { productCreateModalAtom } from '../../modals/product-create/productCreateModalAtom';


export function ProductsPageHeader(): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const setModalState = useSetRecoilState(productCreateModalAtom);

    const handleProductCreateModalOpen = () => {
        setModalState({ open: true });
    };

    return (
        <div className={classes.header}>
            <Typography variant='h2' gutterBottom>
                {t('product.products')}
            </Typography>
            <div className={classes.headerActions}>
                <Tooltip title={t('product.addProduct')!}>
                    <IconButton onClick={handleProductCreateModalOpen} aria-label={t('product.addProduct')}>
                        <AddIcon />
                    </IconButton>
                </Tooltip>
            </div>
        </div>
    );
}

const useStyles = makeStyles({
    header: {
        display: 'flex',
    },
    headerActions: {
        marginLeft: 'auto',
        display: 'flex',
        flexShrink: 0,
        alignItems: 'flex-start',
    },
});
