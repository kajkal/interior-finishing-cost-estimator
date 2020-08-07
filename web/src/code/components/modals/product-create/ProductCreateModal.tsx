import React from 'react';
import * as Yup from 'yup';
import { TFunction } from 'i18next';
import { Reference } from '@apollo/client';
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

import { FormikCurrencyAmountField } from '../../common/form-fields/currency-amount/FormikCurrencyAmountField';
import { usePageLinearProgressRevealer } from '../../common/progress-indicators/usePageLinearProgressRevealer';
import { CurrencyAmountFormData, useCreateProductMutation } from '../../../../graphql/generated-types';
import { FormikRichTextEditor } from '../../common/form-fields/ritch-text-editor/FormikRichTextEditor';
import { useCurrentUserDataSelectors } from '../../../utils/hooks/useCurrentUserDataSelectors';
import { CurrencyAmount } from '../../common/form-fields/currency-amount/CurrencyAmountField';
import { useModalNavigationBlocker } from '../../../utils/hooks/useModalNavigationBlocker';
import { isSlateDocumentNotEmpty } from '../../../utils/validation/richTestEditorSchema';
import { emptyEditorValue } from '../../common/form-fields/ritch-text-editor/options';
import { ApolloErrorHandler } from '../../../utils/error-handling/ApolloErrorHandler';
import { FormikSubmitButton } from '../../common/form-fields/FormikSubmitButton';
import { FormikTagsField } from '../../common/form-fields/tags/FormikTagsField';
import { FormikTextField } from '../../common/form-fields/FormikTextField';
import { TagOption } from '../../common/form-fields/tags/TagsField';
import { productCreateModalAtom } from './productCreateModalAtom';
import { ResponsiveModalProps } from '../ResponsiveModalProps';


type ProductCreateFormData = {
    name: string;
    tags: TagOption[];
    description: SlateDocument;
    price: CurrencyAmount;
};

export function ProductCreateModal({ isMobile }: ResponsiveModalProps): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const [ { tags }, userData ] = useCurrentUserDataSelectors();
    const [ { open }, setModalState ] = useRecoilState(productCreateModalAtom);

    const handleModalClose = React.useCallback(() => {
        setModalState((prevState) => ({ ...prevState, open: false }));
    }, [ setModalState ]);

    const validationSchema = useProductCreateFormValidationSchema(t);
    const handleSubmit = useProductCreateFormSubmitHandler(handleModalClose, userData?.slug);

    useModalNavigationBlocker(handleModalClose, open);
    const titleId = 'product-create-modal-title';

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
                {t('modal.productCreate.title')}
            </DialogTitle>

            <Formik<ProductCreateFormData>
                initialValues={{
                    name: '',
                    description: emptyEditorValue,
                    price: {
                        currency: 'PLN',
                        amount: undefined,
                    },
                    tags: [],
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ submitForm }) => (
                    <>
                        <DialogContent>
                            <Form className='product-create-form'>

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
                            <FormikSubmitButton type='button' onClick={submitForm}>
                                {t('modal.productCreate.create')}
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
function useProductCreateFormValidationSchema(t: TFunction) {
    return React.useMemo(() => Yup.object<ProductCreateFormData>({

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
function useProductCreateFormSubmitHandler(onModalClose: () => void, userSlug: string | undefined) {
    const [ createProductMutation, { loading } ] = useCreateProductMutation();
    usePageLinearProgressRevealer(loading);

    return React.useCallback<FormikConfig<ProductCreateFormData>['onSubmit']>(async ({ name, tags, description, price }) => {
        try {
            await createProductMutation({
                variables: {
                    name: name,
                    description: JSON.stringify(description),
                    price: isValidCurrencyAmountFormData(price) ? price : null,
                    tags: tags.length ? tags.map(({ name }) => name) : null,
                },
                update: (cache, { data }) => {
                    const createdProduct = data?.createProduct;
                    createdProduct && cache.modify({
                        id: cache.identify({ __typename: 'User', slug: userSlug }),
                        fields: {
                            products: (existingProductRefs: Reference[] = [], { toReference }) => (
                                [ ...existingProductRefs, toReference(createdProduct) ]
                            ),
                        },
                    });
                },
            });
            onModalClose();
        } catch (error) {
            ApolloErrorHandler.process(error).verifyIfAllErrorsAreHandled();
        }
    }, [ onModalClose, userSlug, createProductMutation ]);
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
