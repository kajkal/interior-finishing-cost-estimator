import React from 'react';
import clsx from 'clsx';
import * as Yup from 'yup';
import { TFunction } from 'i18next';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Form, Formik, FormikConfig } from 'formik';

import { makeStyles } from '@material-ui/core/styles';

import { MutationCreateProjectArgs, Project, useCreateProjectMutation } from '../../../../graphql/generated-types';
import { useCurrentUserCachedData } from '../../../utils/hooks/useCurrentUserCachedData';
import { ApolloErrorHandler } from '../../../utils/error-handling/ApolloErrorHandler';
import { FormikSubmitButton } from '../../common/form-fields/FormikSubmitButton';
import { FormikTextField } from '../../common/form-fields/FormikTextField';
import { nav } from '../../../config/nav';


export interface CreateProjectFormProps {
    formClassName: string;
}

type CreateProjectFormData = MutationCreateProjectArgs;

export function CreateProjectForm({ formClassName }: CreateProjectFormProps): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const userData = useCurrentUserCachedData();
    const validationSchema = useLoginFormValidationSchema(t);
    const handleSubmit = useLoginFormSubmitHandler(userData?.slug);

    return (
        <Formik<CreateProjectFormData>
            initialValues={{
                name: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            <Form className={clsx('create-project-form', formClassName)}>

                <FormikTextField
                    id='create-project-email-input'
                    aria-label={t('form.projectName.ariaLabel')}
                    name='name'
                    label={t('form.projectName.label')}
                    fullWidth
                />

                <FormikSubmitButton
                    className={classes.submit}
                    fullWidth
                >
                    {t('createProjectPage.createProject')}
                </FormikSubmitButton>

            </Form>
        </Formik>
    );
}


/**
 * Validation schema
 */
function useLoginFormValidationSchema(t: TFunction) {
    return React.useMemo(() => Yup.object<CreateProjectFormData>({

        name: Yup.string()
            .min(3, t('form.projectName.validation.tooShort'))
            .max(50, t('form.projectName.validation.tooLong'))
            .required(t('form.projectName.validation.required')),

    }).defined(), [ t ]);
}


/**
 * Submit handler
 */
function useLoginFormSubmitHandler(userSlug: string | undefined) {
    const navigate = useNavigate();
    const [ createProjectMutation ] = useCreateProjectMutation();

    return React.useCallback<FormikConfig<CreateProjectFormData>['onSubmit']>(async (values) => {
        try {
            const { data } = await createProjectMutation({
                variables: values,
                update: (cache, { data }) => {
                    const createdProject = data?.createProject;
                    createdProject && cache.modify({
                        id: cache.identify({ __typename: 'User', slug: userSlug }),
                        fields: {
                            projects: (existingProjects: Project[] = [], { toReference }) => (
                                [ ...existingProjects, toReference(createdProject) ]
                            ),
                        },
                    });
                },
            });
            navigate(nav.project(data!.createProject.slug));
        } catch (error) {
            ApolloErrorHandler.process(error).verifyIfAllErrorsAreHandled();
        }
    }, [ userSlug, navigate, createProjectMutation ]);
}


const useStyles = makeStyles((theme) => ({
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));
