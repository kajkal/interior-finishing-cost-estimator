import React from 'react';
import * as Yup from 'yup';
import { TFunction } from 'i18next';
import { useRecoilState } from 'recoil/dist';
import { useTranslation } from 'react-i18next';
import { Form, Formik, FormikConfig } from 'formik';
import { SlateDocument } from '@udecode/slate-plugins';

import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';

import { usePageLinearProgressRevealer } from '../../common/progress-indicators/usePageLinearProgressRevealer';
import { FormikRichTextEditor } from '../../common/form-fields/ritch-text-editor/FormikRichTextEditor';
import { mapLocationOptionToLocationFormData } from '../../../utils/mappers/locationMapper';
import { FormikLocationField } from '../../common/form-fields/location/FormikLocationField';
import { FormikCategoryField } from '../../common/form-fields/category/FormikCategoryField';
import { useModalNavigationBlocker } from '../../../utils/hooks/useModalNavigationBlocker';
import { isSlateDocumentNotEmpty } from '../../../utils/validation/richTestEditorSchema';
import { InquiryUpdateFormData, inquiryUpdateModalAtom } from './inquiryUpdateModalAtom';
import { ApolloErrorHandler } from '../../../utils/error-handling/ApolloErrorHandler';
import { emptyEditorValue } from '../../common/form-fields/ritch-text-editor/options';
import { FormikSubmitButton } from '../../common/form-fields/FormikSubmitButton';
import { LocationOption } from '../../common/form-fields/location/LocationField';
import { useUpdateInquiryMutation } from '../../../../graphql/generated-types';
import { FormikTextField } from '../../common/form-fields/FormikTextField';
import { supportedCategories } from '../../../config/supportedCategories';
import { ResponsiveModalProps } from '../ResponsiveModalProps';


export function InquiryUpdateModal({ isMobile }: ResponsiveModalProps): React.ReactElement {
    const { t } = useTranslation();
    const [ { open, inquiryData }, setModalState ] = useRecoilState(inquiryUpdateModalAtom);

    const handleModalClose = React.useCallback(() => {
        setModalState((prevState) => ({ ...prevState, open: false }));
    }, [ setModalState ]);

    const validationSchema = useInquiryUpdateFormValidationSchema(t);
    const handleSubmit = useInquiryUpdateFormSubmitHandler(handleModalClose);

    useModalNavigationBlocker(handleModalClose, open);
    const titleId = 'inquiry-update-modal-title';

    return (
        <Dialog
            fullScreen={isMobile}
            open={open}
            onClose={handleModalClose}
            aria-labelledby={titleId}
            fullWidth
        >
            <DialogTitle id={titleId}>
                {t('inquiry.updateModal.title')}
            </DialogTitle>

            <Formik<InquiryUpdateFormData>
                initialValues={{
                    inquiryId: inquiryData?.inquiryId || '',
                    title: inquiryData?.title || '',
                    description: inquiryData?.description || emptyEditorValue,
                    location: inquiryData?.location || null,
                    category: inquiryData?.category || null,
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, initialValues, submitForm, resetForm }) => {
                    const inInitialState = areValuesEqInitialValues(values, initialValues);
                    return (
                        <>
                            <DialogContent>
                                <Form>

                                    <input type='hidden' name='inquiryId' value={values.inquiryId} />

                                    <FormikTextField
                                        name='title'
                                        label={t('form.inquiryTitle.label')}
                                        aria-label={t('form.inquiryTitle.ariaLabel')}
                                        fullWidth
                                        autoFocus
                                    />

                                    <FormikRichTextEditor
                                        name='description'
                                        label={t('form.inquiryDescription.label')}
                                        aria-label={t('form.inquiryDescription.ariaLabel')}
                                    />

                                    <FormikLocationField
                                        name='location'
                                        label={t('form.location.label')}
                                    />

                                    <FormikCategoryField
                                        name='category'
                                        label={t('form.inquiryCategory.label')}
                                    />

                                </Form>
                            </DialogContent>

                            <DialogActions>
                                <Button type='button' variant='outlined' onClick={handleModalClose}>
                                    {t('form.common.cancel')}
                                </Button>
                                <Button type='button' variant='outlined' onClick={resetForm as () => void}
                                    disabled={inInitialState}>
                                    {t('form.common.reset')}
                                </Button>
                                <FormikSubmitButton type='button' onClick={submitForm} disabled={inInitialState}>
                                    {t('form.common.update')}
                                </FormikSubmitButton>
                            </DialogActions>
                        </>
                    );
                }}
            </Formik>

        </Dialog>
    );
}


function areValuesEqInitialValues(values: InquiryUpdateFormData, initialValues: InquiryUpdateFormData): boolean {
    return (values.inquiryId === initialValues.inquiryId)
        && (values.title === initialValues.title)
        && (values.description === initialValues.description)
        && (values.location?.place_id === initialValues.location?.place_id)
        && (values.category === initialValues.category);
}


/**
 * Validation schema
 */
function useInquiryUpdateFormValidationSchema(t: TFunction) {
    return React.useMemo(() => Yup.object<InquiryUpdateFormData>({

        inquiryId: Yup.string().length(24).required(),

        title: Yup.string()
            .required(t('form.inquiryTitle.validation.required'))
            .min(3, t('form.inquiryTitle.validation.tooShort'))
            .max(255, t('form.inquiryTitle.validation.tooLong')),

        description: Yup.mixed<SlateDocument>()
            .test('match', t('form.inquiryDescription.validation.required'), isSlateDocumentNotEmpty),

        location: Yup.mixed<LocationOption>().required(t('form.location.validation.required')),

        category: Yup.mixed().oneOf([ ...supportedCategories, null ])
            .nullable()
            .required(t('form.inquiryCategory.validation.required')),

    }).defined(), [ t ]);
}


/**
 * Submit handler
 */
function useInquiryUpdateFormSubmitHandler(onModalClose: () => void) {
    const [ updateInquiryMutation, { loading } ] = useUpdateInquiryMutation();
    usePageLinearProgressRevealer(loading);

    return React.useCallback<FormikConfig<InquiryUpdateFormData>['onSubmit']>(async ({ description, location, category, ...rest }) => {
        try {
            await updateInquiryMutation({
                variables: {
                    ...rest,
                    description: JSON.stringify(description),
                    location: await mapLocationOptionToLocationFormData(location!),
                    category: category!,
                },
            });
            onModalClose();
        } catch (error) {
            ApolloErrorHandler.process(error).verifyIfAllErrorsAreHandled();
        }
    }, [ onModalClose, updateInquiryMutation ]);
}
