import React from 'react';
import clsx from 'clsx';
import * as Yup from 'yup';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Form, Formik, FormikConfig } from 'formik';

import { makeStyles } from '@material-ui/core/styles';

import { usePageLinearProgressRevealer } from '../../common/progress-indicators/usePageLinearProgressRevealer';
import { MutationLoginArgs, useLoginMutation } from '../../../../graphql/generated-types';
import { ApolloErrorHandler } from '../../../utils/error-handling/ApolloErrorHandler';
import { FormikSubmitButton } from '../../common/form-fields/FormikSubmitButton';
import { FormikPasswordField } from '../../common/form-fields/FormikPasswordField';
import { FormikTextField } from '../../common/form-fields/FormikTextField';
import { createPasswordSchema } from '../../../utils/validation/passwordSchema';
import { createEmailSchema } from '../../../utils/validation/emailSchema';
import { SessionChannel } from '../../../utils/communication/SessionChannel';
import { useToast } from '../../providers/toast/useToast';


export interface LoginFormProps {
    formClassName: string;
}

type LoginFormData = MutationLoginArgs;

export function LoginForm({ formClassName }: LoginFormProps): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const validationSchema = useLoginFormValidationSchema(t);
    const handleSubmit = useLoginFormSubmitHandler();

    return (
        <Formik<LoginFormData>
            initialValues={{
                email: '',
                password: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            <Form className={clsx('login-form', formClassName)}>

                <FormikTextField
                    aria-label={t('form.email.ariaLabel')}
                    name='email'
                    type='email'
                    label={t('form.email.label')}
                    autoComplete='email'
                    fullWidth
                />

                <FormikPasswordField
                    aria-label={t('form.password.ariaLabel')}
                    name='password'
                    label={t('form.password.label')}
                    autoComplete='current-password'
                    fullWidth
                />

                <FormikSubmitButton
                    className={classes.submit}
                    fullWidth
                >
                    {t('loginPage.logIn')}
                </FormikSubmitButton>

            </Form>
        </Formik>
    );
}


/**
 * Validation schema
 */
function useLoginFormValidationSchema(t: TFunction) {
    return React.useMemo(() => Yup.object<LoginFormData>({
        email: createEmailSchema(t),
        password: createPasswordSchema(t),
    }).defined(), [ t ]);
}


/**
 * Submit handler
 */
function useLoginFormSubmitHandler() {
    const { errorToast } = useToast();
    const [ loginMutation, { loading } ] = useLoginMutation();
    usePageLinearProgressRevealer(loading);

    return React.useCallback<FormikConfig<LoginFormData>['onSubmit']>(async (values) => {
        try {
            await loginMutation({
                variables: values,
                update: async (cache, { data }) => {
                    data && await SessionChannel.publishLoginSessionAction(data.login);
                },
            });
        } catch (error) {
            ApolloErrorHandler.process(error)
                .handleGraphQlError('BAD_CREDENTIALS', () => (
                    errorToast(({ t }) => t('loginPage.badCredentials'))
                ))
                .verifyIfAllErrorsAreHandled();
        }
    }, [ errorToast, loginMutation ]);
}


const useStyles = makeStyles((theme) => ({
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));
