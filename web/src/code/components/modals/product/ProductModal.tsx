import React from 'react';
import { useRecoilState } from 'recoil/dist';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { RichTextPreviewer } from '../../common/form-fields/ritch-text-editor/RichTextPreviewer';
import { useModalNavigationBlocker } from '../../../utils/hooks/useModalNavigationBlocker';
import { FormattedCurrencyAmount } from '../../common/misc/FormattedCurrencyAmount';
import { ResponsiveModalProps } from '../ResponsiveModalProps';
import { productModalAtom } from './productModalAtom';
import { TagChip } from '../../common/misc/TagChip';


export function ProductModal({ isMobile }: ResponsiveModalProps): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const [ { open, productData }, setModalState ] = useRecoilState(productModalAtom);

    const handleModalClose = React.useCallback(() => {
        setModalState((prevState) => ({ ...prevState, open: false }));
    }, [ setModalState ]);

    useModalNavigationBlocker(handleModalClose, open);
    const titleId = 'product-modal-title';

    return (
        <Dialog
            fullScreen={isMobile}
            open={open}
            onClose={handleModalClose}
            aria-labelledby={titleId}
            fullWidth
        >
            <DialogTitle id={titleId} className={classes.header} disableTypography>
                <Typography component='h2' variant='h6'>
                    {productData?.name || ''}
                </Typography>
                {(productData?.price) && (
                    <FormattedCurrencyAmount
                        currencyAmount={productData.price}
                        className={classes.productPrice}
                    />
                )}
            </DialogTitle>

            {(productData) && (
                <DialogContent>

                    <div>
                        {productData.tags?.map((tag) => (
                            <TagChip
                                key={tag}
                                label={tag}
                            />
                        ))}
                    </div>

                    <RichTextPreviewer value={productData.description} className={classes.description} />

                </DialogContent>
            )}

            <DialogActions>
                <Button type='button' variant='outlined' onClick={handleModalClose}>
                    {t('form.common.close')}
                </Button>
            </DialogActions>

        </Dialog>
    );
}


const useStyles = makeStyles((theme) => ({
    header: {
        display: 'flex',
    },
    productPrice: {
        marginLeft: 'auto',
    },
    description: {
        marginTop: theme.spacing(4),
    },
}));
