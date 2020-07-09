import React from 'react';
import * as Yup from 'yup';
import classNames from 'classnames';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Form, Formik, FormikConfig } from 'formik';

import { makeStyles } from '@material-ui/core/styles';

import { MutationLoginArgs, useLoginMutation } from '../../../../graphql/generated-types';
import { FormikSubmitButton } from '../../common/form-fields/FormikSubmitButton';
import { ApolloErrorHandler } from '../../providers/apollo/errors/ApolloErrorHandler';
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
            <Form className={classNames('login-form', formClassName)}>

                <FormikTextField
                    id='login-email-input'
                    aria-label={t('form.email.ariaLabel')}
                    name='email'
                    type='email'
                    label={t('form.email.label')}
                    autoComplete='email'
                    fullWidth
                />

                <FormikPasswordField
                    id='login-password-input'
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
    const [ loginMutation ] = useLoginMutation();

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
                .handleNetworkError(() => errorToast(({ t }) => t('error.networkError')))
                .handleGraphQlErrors({
                    'BAD_CREDENTIALS': () => errorToast(({ t }) => t('loginPage.badCredentials')),
                })
                .finish();
        }
    }, [ errorToast, loginMutation ]);
}


const useStyles = makeStyles((theme) => ({
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));
