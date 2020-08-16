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

import { InquiriesDocument, InquiriesQuery, useCreateInquiryMutation } from '../../../../graphql/generated-types';
import { usePageLinearProgressRevealer } from '../../common/progress-indicators/usePageLinearProgressRevealer';
import { FormikRichTextEditor } from '../../common/form-fields/ritch-text-editor/FormikRichTextEditor';
import { FormikLocationField } from '../../common/form-fields/location/FormikLocationField';
import { FormikCategoryField } from '../../common/form-fields/category/FormikCategoryField';
import { mapLocationOptionToLocationFormData } from '../../../utils/mappers/locationMapper';
import { useModalNavigationBlocker } from '../../../utils/hooks/useModalNavigationBlocker';
import { isSlateDocumentNotEmpty } from '../../../utils/validation/richTestEditorSchema';
import { emptyEditorValue } from '../../common/form-fields/ritch-text-editor/options';
import { ApolloErrorHandler } from '../../../utils/error-handling/ApolloErrorHandler';
import { FormikSubmitButton } from '../../common/form-fields/FormikSubmitButton';
import { LocationOption } from '../../common/form-fields/location/LocationField';
import { CategoryOption } from '../../common/form-fields/category/CategoryField';
import { FormikTextField } from '../../common/form-fields/FormikTextField';
import { supportedCategories } from '../../../config/supportedCategories';
import { inquiryCreateModalAtom } from './inquiryCreateModalAtom';
import { ResponsiveModalProps } from '../ResponsiveModalProps';


type InquiryCreateFormData = {
    title: string;
    description: SlateDocument;
    location: LocationOption | null;
    category: CategoryOption | null;
};

export function InquiryCreateModal({ isMobile }: ResponsiveModalProps): React.ReactElement {
    const { t } = useTranslation();
    const [ { open, initialLocation }, setModalState ] = useRecoilState(inquiryCreateModalAtom);

    const handleModalClose = React.useCallback(() => {
        setModalState((prevState) => ({ ...prevState, open: false }));
    }, [ setModalState ]);

    const validationSchema = InquiryCreateFormValidationSchema(t);
    const handleSubmit = InquiryCreateFormSubmitHandler(handleModalClose);

    useModalNavigationBlocker(handleModalClose, open);
    const titleId = 'inquiry-create-modal-title';

    return (
        <Dialog
            fullScreen={isMobile}
            open={open}
            onClose={handleModalClose}
            aria-labelledby={titleId}
            fullWidth
        >
            <DialogTitle id={titleId}>
                {t('inquiry.createModal.title')}
            </DialogTitle>

            <Formik<InquiryCreateFormData>
                initialValues={{
                    title: '',
                    description: emptyEditorValue,
                    location: initialLocation || null,
                    category: null,
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, errors, submitForm }) => (
                    <>
                        <DialogContent>
                            <Form>

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
function InquiryCreateFormValidationSchema(t: TFunction) {
    return React.useMemo(() => Yup.object<InquiryCreateFormData>({

        title: Yup.string()
            .required(t('form.inquiryTitle.validation.required'))
            .min(3, t('form.inquiryTitle.validation.tooShort'))
            .max(255, t('form.inquiryTitle.validation.tooLong')),

        description: Yup.mixed<SlateDocument>()
            .test('match', t('form.inquiryDescription.validation.required'), isSlateDocumentNotEmpty),

        location: Yup.mixed<LocationOption>().required(t('form.location.validation.required')),

        category: Yup.object<CategoryOption>({
            id: Yup.string().oneOf(supportedCategories).defined(),
            label: Yup.string().defined(),
        }).nullable().required(t('form.inquiryCategory.validation.required')),

    }).defined(), [ t ]);
}


/**
 * Submit handler
 */
function InquiryCreateFormSubmitHandler(onModalClose: () => void) {
    const [ createInquiryMutation, { loading } ] = useCreateInquiryMutation();
    usePageLinearProgressRevealer(loading);

    return React.useCallback<FormikConfig<InquiryCreateFormData>['onSubmit']>(async ({ title, description, location, category }) => {
        try {
            await createInquiryMutation({
                variables: {
                    title,
                    description: JSON.stringify(description),
                    location: await mapLocationOptionToLocationFormData(location!),
                    category: category?.id!,
                },
                update: (cache, { data }) => {
                    const createdInquiry = data?.createInquiry;
                    if (createdInquiry) {
                        const inquiriesResult = cache.readQuery<InquiriesQuery>({ query: InquiriesDocument });
                        cache.writeQuery<InquiriesQuery>({
                            broadcast: false,
                            query: InquiriesDocument,
                            data: {
                                allInquiries: [
                                    createdInquiry,
                                    ...inquiriesResult?.allInquiries || [],
                                ],
                            },
                        });
                    }
                },
            });
            onModalClose();
        } catch (error) {
            ApolloErrorHandler.process(error).verifyIfAllErrorsAreHandled();
        }
    }, [ onModalClose, createInquiryMutation ]);
}
