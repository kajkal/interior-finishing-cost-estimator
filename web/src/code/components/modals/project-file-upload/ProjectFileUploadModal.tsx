import React from 'react';
import * as Yup from 'yup';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil/dist';
import { Form, Formik, FormikConfig } from 'formik';

import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';

import { MutationUploadProjectFileArgs, ResourceData, useUploadProjectFileMutation } from '../../../../graphql/generated-types';
import { usePageLinearProgressRevealer } from '../../common/progress-indicators/usePageLinearProgressRevealer';
import { useModalNavigationBlocker } from '../../../utils/hooks/useModalNavigationBlocker';
import { ApolloErrorHandler } from '../../../utils/error-handling/ApolloErrorHandler';
import { FormikDropzoneArea } from '../../common/form-fields/FormikDropzoneArea';
import { FormikSubmitButton } from '../../common/form-fields/FormikSubmitButton';
import { FormikTextField } from '../../common/form-fields/FormikTextField';
import { projectFileUploadModalAtom } from './projectFileUploadModalAtom';
import { ResponsiveModalProps } from '../ResponsiveModalProps';


type ProjectFileUploadFormData = MutationUploadProjectFileArgs;

export function ProjectFileUploadModal({ isMobile }: ResponsiveModalProps): React.ReactElement {
    const { t } = useTranslation();
    const [ { open, projectData }, setModalState ] = useRecoilState(projectFileUploadModalAtom);

    const handleModalClose = React.useCallback(() => {
        setModalState((prevState) => ({ ...prevState, open: false }));
    }, [ setModalState ]);

    const validationSchema = useProjectFileUploadFormValidationSchema(t);
    const handleSubmit = useProjectFileUploadFormSubmitHandler(handleModalClose);

    useModalNavigationBlocker(handleModalClose, open);
    const titleId = 'project-file-upload-modal-title';

    return (
        <Dialog
            fullScreen={isMobile}
            open={open}
            onClose={handleModalClose}
            aria-labelledby={titleId}
            fullWidth
        >
            <DialogTitle id={titleId}>
                {t('modal.projectFileUpload.title', { projectName: projectData?.name })}
            </DialogTitle>

            <Formik<ProjectFileUploadFormData>
                initialValues={{
                    projectSlug: projectData?.slug || '',
                    file: null,
                    description: '',
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, submitForm }) => (
                    <>
                        <DialogContent>
                            <Form className='project-file-upload-form'>

                                <input type='hidden' name='projectSlug' value={values.projectSlug} />

                                <FormikDropzoneArea
                                    name='file'
                                    label={t('form.projectFile.label')}
                                    autoFocus
                                />

                                <FormikTextField
                                    id={'project-file-upload-description-input'}
                                    aria-label={t('form.projectFileDescription.ariaLabel')}
                                    name='description'
                                    label={t('form.projectFileDescription.label')}
                                    fullWidth
                                    optional
                                />

                            </Form>
                        </DialogContent>

                        <DialogActions>
                            <Button type='button' variant='outlined' onClick={handleModalClose}>
                                {t('modal.common.cancel')}
                            </Button>
                            <FormikSubmitButton type='button' onClick={submitForm}>
                                {t('modal.projectFileUpload.upload')}
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
function useProjectFileUploadFormValidationSchema(t: TFunction) {
    return React.useMemo(() => Yup.object<ProjectFileUploadFormData>({
        projectSlug: Yup.string().min(3).required(),
        file: Yup.mixed().required(t('form.projectFile.validation.required')),
        description: Yup.string().max(255, t('form.projectFileDescription.validation.tooLong')),
    }).defined(), [ t ]);
}


/**
 * Submit handler
 */
function useProjectFileUploadFormSubmitHandler(onModalClose: () => void) {
    const [ uploadProjectFileMutation, { loading } ] = useUploadProjectFileMutation();
    usePageLinearProgressRevealer(loading);

    return React.useCallback<FormikConfig<ProjectFileUploadFormData>['onSubmit']>(async (values) => {
        try {
            await uploadProjectFileMutation({
                variables: { ...values, description: values.description || null },
                update: (cache, { data }) => {
                    const uploadedFile = data?.uploadProjectFile;
                    uploadedFile && cache.modify({
                        id: cache.identify({ __typename: 'Project', slug: values.projectSlug }),
                        fields: {
                            files: (existingFiles: ResourceData[] = []) => {
                                const filesWithoutDuplicates = existingFiles.filter(({ name }) => name !== uploadedFile.name);
                                return [ ...filesWithoutDuplicates, uploadedFile ];
                            },
                        },
                    });
                },
            });
            onModalClose();
        } catch (error) {
            ApolloErrorHandler.process(error).verifyIfAllErrorsAreHandled();
        }
    }, [ onModalClose, uploadProjectFileMutation ]);
}
