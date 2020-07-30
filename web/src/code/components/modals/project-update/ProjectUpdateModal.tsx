import React from 'react';
import * as Yup from 'yup';
import { TFunction } from 'i18next';
import { useNavigate } from 'react-router';
import { Reference } from '@apollo/client';
import { useRecoilState } from 'recoil/dist';
import { useTranslation } from 'react-i18next';
import { Form, Formik, FormikConfig } from 'formik';

import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';

import { MutationUpdateProjectArgs, ProjectDetailsDocument, ProjectDetailsQuery, useUpdateProjectMutation } from '../../../../graphql/generated-types';
import { useModalNavigationBlocker } from '../../../utils/hooks/useModalNavigationBlocker';
import { useCurrentUserCachedData } from '../../../utils/hooks/useCurrentUserCachedData';
import { ApolloErrorHandler } from '../../../utils/error-handling/ApolloErrorHandler';
import { FormikSubmitButton } from '../../common/form-fields/FormikSubmitButton';
import { FormikTextField } from '../../common/form-fields/FormikTextField';
import { projectUpdateModalAtom } from './projectUpdateModalAtom';
import { ResponsiveModalProps } from '../ResponsiveModalProps';
import { useToast } from '../../providers/toast/useToast';
import { nav } from '../../../config/nav';


type ProjectUpdateFormData = MutationUpdateProjectArgs;

export function ProjectUpdateModal({ isMobile }: ResponsiveModalProps): React.ReactElement {
    const { t } = useTranslation();
    const [ { open, projectData }, setModalState ] = useRecoilState(projectUpdateModalAtom);

    const handleModalClose = React.useCallback(() => {
        setModalState((prevState) => ({ ...prevState, open: false }));
    }, [ setModalState ]);

    const validationSchema = useProjectUpdateFormValidationSchema(t);
    const handleSubmit = useProjectUpdateFormSubmitHandler(handleModalClose);

    const areInitialValues = (currentValues: ProjectUpdateFormData) => (
        (projectData?.slug !== currentValues.projectSlug) ||
        (projectData?.name !== currentValues.name)
    );

    useModalNavigationBlocker(handleModalClose, open);
    const titleId = 'project-update-modal-title';

    return (
        <Dialog
            fullScreen={isMobile}
            open={open}
            onClose={handleModalClose}
            aria-labelledby={titleId}
            fullWidth
        >
            <DialogTitle id={titleId}>
                {t('modal.projectUpdate.title', { projectName: projectData?.name })}
            </DialogTitle>

            <Formik<ProjectUpdateFormData>
                initialValues={{
                    projectSlug: projectData?.slug || '',
                    name: projectData?.name || '',
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, submitForm, resetForm }) => (
                    <>
                        <DialogContent>
                            <Form className='update-project-form'>

                                <input type='hidden' name='projectSlug' value={values.projectSlug} />

                                <FormikTextField
                                    id='update-project-project-name-input'
                                    aria-label={t('form.projectName.ariaLabel')}
                                    name='name'
                                    label={t('form.projectName.label')}
                                    fullWidth
                                    helperText={(projectData?.name !== values.name) ? t('modal.projectUpdate.urlWillChange') : undefined}
                                />

                            </Form>
                        </DialogContent>

                        <DialogActions>
                            <Button type='button' variant='outlined' onClick={handleModalClose}>
                                {t('modal.common.cancel')}
                            </Button>
                            <Button type='button' variant='outlined' onClick={resetForm as () => void}
                                disabled={!areInitialValues(values)}>
                                {t('modal.common.reset')}
                            </Button>
                            <FormikSubmitButton type='button' onClick={submitForm} disabled={!areInitialValues(values)}>
                                {t('modal.projectUpdate.update')}
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
function useProjectUpdateFormValidationSchema(t: TFunction) {
    return React.useMemo(() => Yup.object<ProjectUpdateFormData>({
        projectSlug: Yup.string().min(3).required(),
        name: Yup.string()
            .min(3, t('form.projectName.validation.tooShort'))
            .max(50, t('form.projectName.validation.tooLong'))
            .required(t('form.projectName.validation.required')),
    }).defined(), [ t ]);
}


/**
 * Submit handler
 */
function useProjectUpdateFormSubmitHandler(onModalClose: () => void) {
    const navigate = useNavigate();
    const { errorToast } = useToast();
    const userCachedData = useCurrentUserCachedData();
    const [ updateProjectMutation ] = useUpdateProjectMutation();

    return React.useCallback<FormikConfig<ProjectUpdateFormData>['onSubmit']>(async (values) => {
        try {
            await updateProjectMutation({
                variables: values,
                update: (cache, { data }) => {
                    const updatedProject = data?.updateProject;
                    const prevProjectSlug = values.projectSlug;
                    const userSlug = userCachedData?.slug;

                    // cache modifications are only needed when project slug changed
                    if (updatedProject && (updatedProject.slug !== prevProjectSlug) && userSlug) {

                        // write project details under new cache project ref id
                        cache.writeQuery<ProjectDetailsQuery>({
                            broadcast: false,
                            query: ProjectDetailsDocument,
                            variables: { slug: updatedProject.slug },
                            data: {
                                me: {
                                    __typename: 'User',
                                    slug: userSlug,
                                    project: updatedProject,
                                },
                            },
                        });

                        cache.modify({
                            broadcast: false,
                            id: cache.identify({ __typename: 'User', slug: userSlug }),
                            fields: {
                                // remove cached project data associated with old slug:
                                project: (existingProjectRef: Reference, { readField, DELETE }) => (
                                    (readField('slug', existingProjectRef) === prevProjectSlug)
                                        ? DELETE
                                        : existingProjectRef
                                ),
                                // replace ref to old cached project with ref to new one:
                                projects: (existingProjectRefs: Reference[] = [], { readField, toReference }) => (
                                    existingProjectRefs.map((projectRef) => (
                                        (readField('slug', projectRef) === prevProjectSlug)
                                            ? toReference(updatedProject)
                                            : projectRef
                                    ))
                                ),
                            },
                        });

                        navigate(nav.project(updatedProject.slug), { replace: true });

                        cache.evict({
                            id: cache.identify({ __typename: 'Project', slug: prevProjectSlug }),
                        });
                    }
                },
            });
        } catch (error) {
            ApolloErrorHandler.process(error)
                .handleGraphQlError('RESOURCE_OWNER_ROLE_REQUIRED', () => {
                    errorToast(({ t }) => t('projectPage.resourceOwnerRoleRequiredError'));
                })
                .handleGraphQlError('PROJECT_NOT_FOUND', () => {
                    errorToast(({ t }) => t('projectPage.projectNotFoundError'));
                })
                .verifyIfAllErrorsAreHandled();
        }

        onModalClose();
    }, [ onModalClose, navigate, errorToast, userCachedData, updateProjectMutation ]);
}
