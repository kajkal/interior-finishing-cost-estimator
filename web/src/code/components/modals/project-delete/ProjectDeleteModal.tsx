import React from 'react';
import * as Yup from 'yup';
import { useNavigate } from 'react-router';
import { Reference } from '@apollo/client';
import { useRecoilState } from 'recoil/dist';
import { useTranslation } from 'react-i18next';
import { Form, Formik, FormikConfig } from 'formik';

import { makeStyles } from '@material-ui/core/styles';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';

import { usePageLinearProgressRevealer } from '../../common/progress-indicators/usePageLinearProgressRevealer';
import { MutationDeleteProjectArgs, useDeleteProjectMutation } from '../../../../graphql/generated-types';
import { useModalNavigationBlocker } from '../../../utils/hooks/useModalNavigationBlocker';
import { useCurrentUserCachedData } from '../../../utils/hooks/useCurrentUserCachedData';
import { ApolloErrorHandler } from '../../../utils/error-handling/ApolloErrorHandler';
import { FormikSubmitButton } from '../../common/form-fields/FormikSubmitButton';
import { projectDeleteModalAtom } from './projectDeleteModalAtom';
import { nav } from '../../../config/nav';


type ProjectDeleteFormData = MutationDeleteProjectArgs;

export function ProjectDeleteModal(): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const [ { open, projectData }, setModalState ] = useRecoilState(projectDeleteModalAtom);

    const handleModalClose = React.useCallback(() => {
        setModalState((prevState) => ({ ...prevState, open: false }));
    }, [ setModalState ]);

    const validationSchema = useProjectDeleteFormValidationSchema();
    const handleSubmit = useProjectDeleteFormSubmitHandler(handleModalClose);

    useModalNavigationBlocker(handleModalClose, open);
    const titleId = 'delete-project-modal-title';
    const contentId = 'delete-project-modal-content';

    return (
        <Dialog open={open} onClose={handleModalClose} aria-labelledby={titleId} aria-describedby={contentId}>

            <DialogTitle id={titleId}>
                {t('modal.projectDelete.title', { projectName: projectData?.name })}
            </DialogTitle>

            <Formik<ProjectDeleteFormData>
                initialValues={{
                    projectSlug: projectData?.slug || '',
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, submitForm }) => (
                    <>
                        <DialogContent id={contentId}>
                            <Typography color='textSecondary'>
                                {t('modal.projectDelete.firstLine')}
                            </Typography>
                            <Typography color='textSecondary' className={classes.contentBottom}>
                                {t('modal.projectDelete.secondLine')}
                            </Typography>

                            <Form className='delete-project-form'>
                                <input type='hidden' name='projectSlug' value={values.projectSlug} />
                            </Form>

                        </DialogContent>

                        <DialogActions>
                            <Button type='button' variant='outlined' onClick={handleModalClose} autoFocus>
                                {t('modal.common.cancel')}
                            </Button>
                            <FormikSubmitButton type='button' onClick={submitForm} className={classes.deleteButton}>
                                {t('modal.projectDelete.delete')}
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
function useProjectDeleteFormValidationSchema() {
    return React.useMemo(() => Yup.object<ProjectDeleteFormData>({
        projectSlug: Yup.string().min(3).required(),
    }).defined(), []);
}


/**
 * Submit handler
 */
function useProjectDeleteFormSubmitHandler(onModalClose: () => void) {
    const navigate = useNavigate();
    const userCachedData = useCurrentUserCachedData();
    const [ deleteProjectMutation, { loading } ] = useDeleteProjectMutation();
    usePageLinearProgressRevealer(loading);

    return React.useCallback<FormikConfig<ProjectDeleteFormData>['onSubmit']>(async (values) => {
        try {
            await deleteProjectMutation({
                variables: values,
                update: (cache, { data }) => {
                    const isSuccess = data?.deleteProject;
                    const userSlug = userCachedData?.slug;

                    if (isSuccess && userSlug) {
                        // navigate first in order to prevent refetch of ProjectDetails query
                        navigate(nav.createProject(), { replace: true });

                        cache.modify({
                            id: cache.identify({ __typename: 'User', slug: userSlug }),
                            fields: {
                                project: (existingProjectRef: Reference, { readField, DELETE }) => (
                                    (readField('slug', existingProjectRef) === values.projectSlug)
                                        ? DELETE
                                        : existingProjectRef
                                ),
                                projects: (existingProjectRefs: Reference[] = [], { readField }) => (
                                    existingProjectRefs.filter((projectRef) => readField('slug', projectRef) !== values.projectSlug)
                                ),
                            },
                        });

                        cache.evict({
                            id: cache.identify({ __typename: 'Project', slug: values.projectSlug }),
                        });
                    }
                },
            });
            onModalClose();
        } catch (error) {
            ApolloErrorHandler.process(error).verifyIfAllErrorsAreHandled();
        }
    }, [ onModalClose, navigate, userCachedData, deleteProjectMutation ]);
}


const useStyles = makeStyles((theme) => ({
    contentBottom: {
        marginBottom: theme.spacing(1.5),
    },
    deleteButton: {
        color: theme.palette.error.contrastText,
        backgroundColor: theme.palette.error.main,
        '&:hover': {
            backgroundColor: theme.palette.error.dark,
            // Reset on touch devices, it doesn't add specificity
            '@media (hover: none)': {
                backgroundColor: theme.palette.error.main,
            },
        },
    },
}));
