import React from 'react';
import * as Yup from 'yup';
import { Reference } from '@apollo/client';
import { useRecoilState } from 'recoil/dist';
import { useTranslation } from 'react-i18next';
import { Form, Formik, FormikConfig } from 'formik';

import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { MutationDeleteProductArgs, useDeleteProductMutation } from '../../../../graphql/generated-types';
import { usePageLinearProgressRevealer } from '../../common/progress-indicators/usePageLinearProgressRevealer';
import { useModalNavigationBlocker } from '../../../utils/hooks/useModalNavigationBlocker';
import { useCurrentUserCachedData } from '../../../utils/hooks/useCurrentUserCachedData';
import { ApolloErrorHandler } from '../../../utils/error-handling/ApolloErrorHandler';
import { FormikSubmitButton } from '../../common/form-fields/FormikSubmitButton';
import { productDeleteModalAtom } from './productDeleteModalAtom';


type ProductDeleteFormData = MutationDeleteProductArgs;

export function ProductDeleteModal(): React.ReactElement {
    const { t } = useTranslation();
    const [ { open, productData }, setModalState ] = useRecoilState(productDeleteModalAtom);

    const handleModalClose = React.useCallback(() => {
        setModalState((prevState) => ({ ...prevState, open: false }));
    }, [ setModalState ]);

    const validationSchema = useProductDeleteFormValidationSchema();
    const handleSubmit = useProductDeleteFormSubmitHandler(handleModalClose);

    useModalNavigationBlocker(handleModalClose, open);
    const titleId = 'delete-product-modal-title';
    const contentId = 'delete-product-modal-content';

    return (
        <Dialog open={open} onClose={handleModalClose} aria-labelledby={titleId} aria-describedby={contentId}>

            <DialogTitle id={titleId}>
                {t('product.deleteModal.title', { productName: productData?.name })}
            </DialogTitle>

            <Formik<ProductDeleteFormData>
                initialValues={{
                    productId: productData?.id || '',
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, submitForm }) => (
                    <>
                        <DialogContent id={contentId}>

                            <Typography color='textSecondary'>
                                {t('product.deleteModal.firstLine')}
                            </Typography>

                            <Form className='delete-product-form'>
                                <input type='hidden' name='productId' value={values.productId} />
                            </Form>

                        </DialogContent>

                        <DialogActions>
                            <Button type='button' variant='outlined' onClick={handleModalClose} autoFocus>
                                {t('form.common.cancel')}
                            </Button>
                            <FormikSubmitButton type='button' onClick={submitForm} danger>
                                {t('form.common.delete')}
                            </FormikSubmitButton>
                        </DialogActions>
                    </>
                )}
            </Formik>

        </Dialog>
    );
}


/**
 * Validation schema
 */
function useProductDeleteFormValidationSchema() {
    return React.useMemo(() => Yup.object<ProductDeleteFormData>({
        productId: Yup.string().length(24).required(),
    }).defined(), []);
}


/**
 * Submit handler
 */
function useProductDeleteFormSubmitHandler(onModalClose: () => void) {
    const userSlug = useCurrentUserCachedData()?.slug;
    const [ deleteProductMutation, { loading } ] = useDeleteProductMutation();
    usePageLinearProgressRevealer(loading);

    return React.useCallback<FormikConfig<ProductDeleteFormData>['onSubmit']>(async (values) => {
        try {
            await deleteProductMutation({
                variables: values,
                update: (cache, { data }) => {
                    const isSuccess = data?.deleteProduct;
                    if (isSuccess) {
                        cache.modify({
                            id: cache.identify({ __typename: 'User', slug: userSlug }),
                            fields: {
                                products: (existingProductRefs: Reference[] = [], { readField }) => (
                                    existingProductRefs.filter((productRef) => readField('id', productRef) !== values.productId)
                                ),
                            },
                        });

                        cache.evict({
                            id: cache.identify({ __typename: 'Product', id: values.productId }),
                        });
                    }
                },
            });
            onModalClose();
        } catch (error) {
            ApolloErrorHandler.process(error).verifyIfAllErrorsAreHandled();
        }
    }, [ onModalClose, userSlug, deleteProductMutation ]);
}
