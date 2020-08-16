import React from 'react';
import * as Yup from 'yup';
import { useRecoilState } from 'recoil/dist';
import { useTranslation } from 'react-i18next';
import { Form, Formik, FormikConfig } from 'formik';

import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { InquiriesDocument, InquiriesQuery, MutationDeleteInquiryArgs, useDeleteInquiryMutation } from '../../../../graphql/generated-types';
import { usePageLinearProgressRevealer } from '../../common/progress-indicators/usePageLinearProgressRevealer';
import { useModalNavigationBlocker } from '../../../utils/hooks/useModalNavigationBlocker';
import { useCurrentUserCachedData } from '../../../utils/hooks/useCurrentUserCachedData';
import { ApolloErrorHandler } from '../../../utils/error-handling/ApolloErrorHandler';
import { FormikSubmitButton } from '../../common/form-fields/FormikSubmitButton';
import { inquiryDeleteModalAtom } from './inquiryDeleteModalAtom';


type InquiryDeleteFormData = MutationDeleteInquiryArgs;

export function InquiryDeleteModal(): React.ReactElement {
    const { t } = useTranslation();
    const [ { open, inquiryData }, setModalState ] = useRecoilState(inquiryDeleteModalAtom);

    const handleModalClose = React.useCallback(() => {
        setModalState((prevState) => ({ ...prevState, open: false }));
    }, [ setModalState ]);

    const validationSchema = useInquiryDeleteFormValidationSchema();
    const handleSubmit = useInquiryDeleteFormSubmitHandler(handleModalClose);

    useModalNavigationBlocker(handleModalClose, open);
    const titleId = 'delete-inquiry-modal-title';
    const contentId = 'delete-inquiry-modal-content';

    return (
        <Dialog open={open} onClose={handleModalClose} aria-labelledby={titleId} aria-describedby={contentId}>

            <DialogTitle id={titleId}>
                {t('inquiry.deleteModal.title', { inquiryTitle: inquiryData?.title })}
            </DialogTitle>

            <Formik<InquiryDeleteFormData>
                initialValues={{
                    inquiryId: inquiryData?.id || '',
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, submitForm }) => (
                    <>
                        <DialogContent id={contentId}>

                            <Typography color='textSecondary'>
                                {t('inquiry.deleteModal.firstLine')}
                            </Typography>

                            <Form>
                                <input type='hidden' name='inquiryId' value={values.inquiryId} />
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
function useInquiryDeleteFormValidationSchema() {
    return React.useMemo(() => Yup.object<InquiryDeleteFormData>({
        inquiryId: Yup.string().length(24).required(),
    }).defined(), []);
}


/**
 * Submit handler
 */
function useInquiryDeleteFormSubmitHandler(onModalClose: () => void) {
    const userSlug = useCurrentUserCachedData()?.slug;
    const [ deleteInquiryMutation, { loading } ] = useDeleteInquiryMutation();
    usePageLinearProgressRevealer(loading);

    return React.useCallback<FormikConfig<InquiryDeleteFormData>['onSubmit']>(async (values) => {
        try {
            await deleteInquiryMutation({
                variables: values,
                update: (cache, { data }) => {
                    const isSuccess = data?.deleteInquiry;
                    if (isSuccess) {
                        const inquiriesResult = cache.readQuery<InquiriesQuery>({ query: InquiriesDocument });
                        cache.writeQuery<InquiriesQuery>({
                            broadcast: false,
                            query: InquiriesDocument,
                            data: {
                                allInquiries: (inquiriesResult?.allInquiries || []).filter(({ id }) => id !== values.inquiryId),
                            },
                        });
                        cache.evict({
                            broadcast: false,
                            id: cache.identify({ __typename: 'Inquiry', id: values.inquiryId }),
                        });
                    }
                },
            });
            onModalClose();
        } catch (error) {
            ApolloErrorHandler.process(error).verifyIfAllErrorsAreHandled();
        }
    }, [ onModalClose, userSlug, deleteInquiryMutation ]);
}
