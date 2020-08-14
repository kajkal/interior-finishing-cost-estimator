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

import { ProjectDetailsDocument, ProjectDetailsQuery, UpdateProjectMutationVariables, useUpdateProjectMutation } from '../../../../graphql/generated-types';
import { mapLocationOptionToLocationFormData, mapLocationToLocationOption } from '../../../utils/mappers/locationMapper';
import { usePageLinearProgressRevealer } from '../../common/progress-indicators/usePageLinearProgressRevealer';
import { FormikLocationField } from '../../common/form-fields/location/FormikLocationField';
import { useModalNavigationBlocker } from '../../../utils/hooks/useModalNavigationBlocker';
import { useCurrentUserCachedData } from '../../../utils/hooks/useCurrentUserCachedData';
import { ApolloErrorHandler } from '../../../utils/error-handling/ApolloErrorHandler';
import { LocationOption } from '../../common/form-fields/location/LocationField';
import { FormikSubmitButton } from '../../common/form-fields/FormikSubmitButton';
import { FormikTextField } from '../../common/form-fields/FormikTextField';
import { projectUpdateModalAtom } from './projectUpdateModalAtom';
import { ResponsiveModalProps } from '../ResponsiveModalProps';
import { nav } from '../../../config/nav';


interface ProjectUpdateFormData extends Omit<UpdateProjectMutationVariables, 'location'> {
    location: LocationOption | null;
}

export function ProjectUpdateModal({ isMobile }: ResponsiveModalProps): React.ReactElement {
    const { t } = useTranslation();
    const [ { open, projectData }, setModalState ] = useRecoilState(projectUpdateModalAtom);

    const handleModalClose = React.useCallback(() => {
        setModalState((prevState) => ({ ...prevState, open: false }));
    }, [ setModalState ]);

    const validationSchema = useProjectUpdateFormValidationSchema(t);
    const handleSubmit = useProjectUpdateFormSubmitHandler(handleModalClose);

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
                {t('project.updateModal.title', { projectName: projectData?.name })}
            </DialogTitle>

            <Formik<ProjectUpdateFormData>
                initialValues={{
                    projectSlug: projectData?.slug || '',
                    name: projectData?.name || '',
                    location: mapLocationToLocationOption(projectData?.location || null),
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

                                    <input type='hidden' name='projectSlug' value={values.projectSlug} />

                                    <FormikTextField
                                        name='name'
                                        label={t('form.projectName.label')}
                                        aria-label={t('form.projectName.ariaLabel')}
                                        helperText={(projectData?.name !== values.name) ? t('project.updateModal.urlWillChange') : undefined}
                                        fullWidth
                                        autoFocus
                                    />

                                    <FormikLocationField
                                        name='location'
                                        label={t('form.projectLocation.label')}
                                        optional
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


function areValuesEqInitialValues(values: ProjectUpdateFormData, initialValues: ProjectUpdateFormData): boolean {
    return (values.projectSlug === initialValues.projectSlug)
        && (values.name === initialValues.name)
        && (values.location?.place_id === initialValues.location?.place_id);
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
        location: Yup.mixed<LocationOption>().defined(),
    }).defined(), [ t ]);
}


/**
 * Submit handler
 */
function useProjectUpdateFormSubmitHandler(onModalClose: () => void) {
    const navigate = useNavigate();
    const userCachedData = useCurrentUserCachedData();
    const [ updateProjectMutation, { loading } ] = useUpdateProjectMutation();
    usePageLinearProgressRevealer(loading);

    return React.useCallback<FormikConfig<ProjectUpdateFormData>['onSubmit']>(async ({ location, ...values }) => {
        try {
            await updateProjectMutation({
                variables: {
                    ...values,
                    location: await mapLocationOptionToLocationFormData(location),
                },
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
            onModalClose();
        } catch (error) {
            ApolloErrorHandler.process(error).verifyIfAllErrorsAreHandled();
        }
    }, [ onModalClose, navigate, userCachedData, updateProjectMutation ]);
}
