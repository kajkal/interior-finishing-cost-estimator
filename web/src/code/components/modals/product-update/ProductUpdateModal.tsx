import React from 'react';
import * as Yup from 'yup';
import { TFunction } from 'i18next';
import { useRecoilState } from 'recoil/dist';
import { useTranslation } from 'react-i18next';
import { Form, Formik, FormikConfig } from 'formik';
import { SlateDocument } from '@udecode/slate-plugins';

import { makeStyles } from '@material-ui/core/styles';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';

import { usePageLinearProgressRevealer } from '../../common/progress-indicators/usePageLinearProgressRevealer';
import { FormikCurrencyAmountField } from '../../common/form-fields/currency-amount/FormikCurrencyAmountField';
import { CurrencyAmountFormData, useUpdateProductMutation } from '../../../../graphql/generated-types';
import { FormikRichTextEditor } from '../../common/form-fields/ritch-text-editor/FormikRichTextEditor';
import { CurrencyAmount } from '../../common/form-fields/currency-amount/CurrencyAmountField';
import { useCurrentUserDataSelectors } from '../../../utils/hooks/useCurrentUserDataSelectors';
import { useModalNavigationBlocker } from '../../../utils/hooks/useModalNavigationBlocker';
import { ProductUpdateFormData, productUpdateModalAtom } from './productUpdateModalAtom';
import { isSlateDocumentNotEmpty } from '../../../utils/validation/richTestEditorSchema';
import { ApolloErrorHandler } from '../../../utils/error-handling/ApolloErrorHandler';
import { emptyEditorValue } from '../../common/form-fields/ritch-text-editor/options';
import { FormikSubmitButton } from '../../common/form-fields/FormikSubmitButton';
import { FormikTagsField } from '../../common/form-fields/tags/FormikTagsField';
import { FormikTextField } from '../../common/form-fields/FormikTextField';
import { TagOption } from '../../common/form-fields/tags/TagsField';
import { ResponsiveModalProps } from '../ResponsiveModalProps';


export function ProductUpdateModal({ isMobile }: ResponsiveModalProps): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const [ { tags }, userData ] = useCurrentUserDataSelectors();
    const [ { open, productData }, setModalState ] = useRecoilState(productUpdateModalAtom);

    const handleModalClose = React.useCallback(() => {
        setModalState((prevState) => ({ ...prevState, open: false }));
    }, [ setModalState ]);

    const validationSchema = useProductUpdateFormValidationSchema(t);
    const handleSubmit = useProductUpdateFormSubmitHandler(handleModalClose, userData?.slug);

    useModalNavigationBlocker(handleModalClose, open);
    const titleId = 'product-update-modal-title';

    return (
        <Dialog
            fullScreen={isMobile}
            open={open}
            onClose={handleModalClose}
            aria-labelledby={titleId}
            classes={{ paperWidthSm: classes.paperWidthSmPlus }}
            fullWidth
        >
            <DialogTitle id={titleId}>
                {t('product.updateModal.title')}
            </DialogTitle>

            <Formik<ProductUpdateFormData>
                initialValues={{
                    productId: productData?.productId || '',
                    name: productData?.name || '',
                    description: productData?.description || emptyEditorValue,
                    price: productData?.price || {
                        currency: 'PLN',
                        amount: undefined,
                    },
                    tags: productData?.tags || [],
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, initialValues, submitForm, resetForm }) => {
                    const inInitialState = areValuesEqInitialValues(values, initialValues);
                    return (
                        <>
                            <DialogContent>
                                <Form className='product-update-form'>

                                    <input type='hidden' name='productId' value={values.productId} />

                                    <FormikTextField
                                        name='name'
                                        label={t('form.projectName.label')}
                                        aria-label={t('form.projectName.ariaLabel')}
                                        fullWidth
                                        autoFocus
                                    />

                                    <FormikRichTextEditor
                                        name='description'
                                        label={t('form.productDescription.label')}
                                        aria-label={t('form.productDescription.ariaLabel')}
                                    />

                                    <FormikCurrencyAmountField
                                        name='price'
                                        label={t('form.productPrice.label')}
                                        aria-label={t('form.productPrice.ariaLabel')}
                                        fullWidth
                                        optional
                                    />

                                    <FormikTagsField
                                        name='tags'
                                        label={t('form.productTags.label')}
                                        definedTagOptions={tags()}
                                        optional
                                    />

                                </Form>

                            </DialogContent>

                            <DialogActions>
                                <Button type='button' variant='outlined' onClick={handleModalClose}>
                                    {t('modal.common.cancel')}
                                </Button>
                                <Button type='button' variant='outlined' onClick={resetForm as () => void}
                                    disabled={inInitialState}>
                                    {t('modal.common.reset')}
                                </Button>
                                <FormikSubmitButton type='button' onClick={submitForm} disabled={inInitialState}>
                                    {t('modal.common.update')}
                                </FormikSubmitButton>
                            </DialogActions>
                        </>
                    );
                }}
            </Formik>

        </Dialog>
    );
}


function areValuesEqInitialValues(values: ProductUpdateFormData, initialValues: ProductUpdateFormData): boolean {
    return (values.productId === initialValues.productId)
        && (values.name === initialValues.name)
        && (values.description === initialValues.description)
        && (values.price.amount === initialValues.price.amount)
        && (values.price.currency === initialValues.price.currency)
        && (values.tags.length === initialValues.tags.length)
        && (values.tags.every(({ name }, i) => name === initialValues.tags[ i ].name));
}


/**
 * Validation schema
 */
function useProductUpdateFormValidationSchema(t: TFunction) {
    return React.useMemo(() => Yup.object<ProductUpdateFormData>({

        productId: Yup.string().length(24).required(),

        name: Yup.string()
            .required(t('form.productName.validation.required'))
            .min(3, t('form.productName.validation.tooShort'))
            .max(255, t('form.productName.validation.tooLong')),

        description: Yup.mixed<SlateDocument>()
            .test('match', t('form.productDescription.validation.required'), isSlateDocumentNotEmpty),

        price: Yup.object<CurrencyAmount>({
            currency: Yup.string().required(t('form.common.currencyAmount.validation.invalidCurrency')),
            amount: Yup.number().max(1e6, t('form.productPrice.validation.tooHigh')),
        }).defined(),

        tags: Yup.array<TagOption>().of(
            Yup.object<TagOption>({
                name: Yup.string().max(255, t('form.common.tags.validation.tooLong')).required(),
            }).required(),
        ).defined(),

    }).defined(), [ t ]);
}


/**
 * Submit handler
 */
function useProductUpdateFormSubmitHandler(onModalClose: () => void, userSlug: string | undefined) {
    const [ updateProductMutation, { loading } ] = useUpdateProductMutation();
    usePageLinearProgressRevealer(loading);

    return React.useCallback<FormikConfig<ProductUpdateFormData>['onSubmit']>(async ({ tags, description, price, ...values }) => {
        try {
            await updateProductMutation({
                variables: {
                    ...values,
                    description: JSON.stringify(description),
                    price: isValidCurrencyAmountFormData(price) ? price : null,
                    tags: tags.length ? tags.map(({ name }) => name) : null,
                },
            });
            onModalClose();
        } catch (error) {
            ApolloErrorHandler.process(error).verifyIfAllErrorsAreHandled();
        }
    }, [ onModalClose, userSlug, updateProductMutation ]);
}

function isValidCurrencyAmountFormData(price: CurrencyAmount): price is CurrencyAmountFormData {
    return price.amount !== undefined;
}

const useStyles = makeStyles((theme) => ({
    paperWidthSmPlus: {
        // for editor toolbar icons to be in one line at least on desktop
        maxWidth: theme.breakpoints.values.sm + 80,
    },
}));
