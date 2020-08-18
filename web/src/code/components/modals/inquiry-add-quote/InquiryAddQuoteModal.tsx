import React from 'react';
import * as Yup from 'yup';
import { TFunction } from 'i18next';
import { useRecoilState } from 'recoil/dist';
import { useTranslation } from 'react-i18next';
import { Form, Formik, FormikConfig } from 'formik';

import { makeStyles } from '@material-ui/core/styles';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';

import { AddQuoteMutationVariables, CurrencyAmountFormData, useAddQuoteMutation } from '../../../../graphql/generated-types';
import { FormikCurrencyAmountField } from '../../common/form-fields/currency-amount/FormikCurrencyAmountField';
import { usePageLinearProgressRevealer } from '../../common/progress-indicators/usePageLinearProgressRevealer';
import { RichTextPreviewer } from '../../common/form-fields/ritch-text-editor/RichTextPreviewer';
import { CurrencyAmount } from '../../common/form-fields/currency-amount/CurrencyAmountField';
import { useModalNavigationBlocker } from '../../../utils/hooks/useModalNavigationBlocker';
import { useCurrentUserCachedData } from '../../../utils/hooks/useCurrentUserCachedData';
import { ApolloErrorHandler } from '../../../utils/error-handling/ApolloErrorHandler';
import { FormikSubmitButton } from '../../common/form-fields/FormikSubmitButton';
import { inquiryAddQuoteModalAtom } from './inquiryAddQuoteModalAtom';
import { ResponsiveModalProps } from '../ResponsiveModalProps';


interface InquiryAddQuoteFormData extends Pick<AddQuoteMutationVariables, 'inquiryId'> {
    price: CurrencyAmount;
}

export function InquiryAddQuoteModal({ isMobile }: ResponsiveModalProps): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const userData = useCurrentUserCachedData();
    const [ { open, inquiryData }, setModalState ] = useRecoilState(inquiryAddQuoteModalAtom);

    const handleModalClose = React.useCallback(() => {
        setModalState((prevState) => ({ ...prevState, open: false }));
    }, [ setModalState ]);

    const validationSchema = useInquiryAddQuoteFormValidationSchema(t);
    const handleSubmit = useInquiryAddQuoteFormSubmitHandler(handleModalClose, userData?.slug);

    useModalNavigationBlocker(handleModalClose, open);
    const titleId = 'inquiry-add-quote-modal-title';

    return (
        <Dialog
            fullScreen={isMobile}
            open={open}
            onClose={handleModalClose}
            aria-labelledby={titleId}
            fullWidth
        >
            <DialogTitle id={titleId}>
                {t('inquiry.addQuoteModal.title')}
            </DialogTitle>

            <Formik<InquiryAddQuoteFormData>
                initialValues={{
                    inquiryId: inquiryData?.id || '',
                    price: {
                        currency: 'PLN',
                        amount: undefined,
                    },
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, submitForm }) => (
                    <>
                        <DialogContent>

                            <div className={classes.inquiryContent}>
                                <Typography variant='h4' gutterBottom>
                                    {inquiryData?.title}
                                </Typography>
                                <RichTextPreviewer value={inquiryData?.description!} />
                            </div>

                            <Form>

                                <input type='hidden' name='inquiryId' value={values.inquiryId} />

                                <FormikCurrencyAmountField
                                    name='price'
                                    label={t('form.inquiryPriceQuote.label')}
                                    aria-label={t('form.inquiryPriceQuote.ariaLabel')}
                                    autoFocus
                                    fullWidth
                                />

                            </Form>

                        </DialogContent>

                        <DialogActions>
                            <Button type='button' variant='outlined' onClick={handleModalClose}>
                                {t('form.common.cancel')}
                            </Button>
                            <FormikSubmitButton type='button' onClick={submitForm}>
                                {t('form.common.create')}
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
function useInquiryAddQuoteFormValidationSchema(t: TFunction) {
    return React.useMemo(() => Yup.object<InquiryAddQuoteFormData>({

        inquiryId: Yup.string().length(24).required(),

        price: Yup.object<CurrencyAmount>({
            currency: Yup.string().required(t('form.common.currencyAmount.validation.invalidCurrency')),
            amount: Yup.number()
                .required(t('form.inquiryPriceQuote.validation.required'))
                .max(1e6, t('form.inquiryPriceQuote.validation.tooHigh')),
        }).required(),

    }).defined(), [ t ]);
}


/**
 * Submit handler
 */
function useInquiryAddQuoteFormSubmitHandler(onModalClose: () => void, userSlug: string | undefined) {
    const [ addQuoteMutation, { loading } ] = useAddQuoteMutation();
    usePageLinearProgressRevealer(loading);

    return React.useCallback<FormikConfig<InquiryAddQuoteFormData>['onSubmit']>(async ({ inquiryId, price }) => {
        try {
            await addQuoteMutation({
                variables: { inquiryId, price: price as CurrencyAmountFormData },
                update: (cache, { data }) => {
                    const updatedQuotes = data?.addQuote;
                    updatedQuotes && cache.modify({
                        id: cache.identify({ __typename: 'Inquiry', id: inquiryId }),
                        fields: {
                            quotes: () => updatedQuotes,
                        },
                    });
                },
            });
            onModalClose();
        } catch (error) {
            ApolloErrorHandler.process(error).verifyIfAllErrorsAreHandled();
        }
    }, [ onModalClose, userSlug, addQuoteMutation ]);
}


const useStyles = makeStyles((theme) => ({
    inquiryContent: {
        borderLeft: `1px solid ${theme.palette.divider}`,
        paddingLeft: theme.spacing(3),
    },
}));
