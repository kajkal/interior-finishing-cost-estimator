import React from 'react';
import * as Yup from 'yup';
import classNames from 'classnames';
import { TFunction } from 'i18next';
import { Trans, useTranslation } from 'react-i18next';
import { Form, Formik, FormikConfig } from 'formik';

import { makeStyles } from '@material-ui/core/styles';

import { MutationRegisterArgs, useRegisterMutation } from '../../../../graphql/generated-types';
import { createPasswordConfirmationSchema } from '../../../utils/validation/passwordConfirmationSchema';
import { FormikSubmitButton } from '../../common/form-fields/FormikSubmitButton';
import { ApolloErrorHandler } from '../../providers/apollo/errors/ApolloErrorHandler';
import { FormikPasswordField } from '../../common/form-fields/FormikPasswordField';
import { FormikTextField } from '../../common/form-fields/FormikTextField';
import { createPasswordSchema } from '../../../utils/validation/passwordSchema';
import { createEmailSchema } from '../../../utils/validation/emailSchema';
import { createNameSchema } from '../../../utils/validation/nameSchema';
import { SessionChannel } from '../../../utils/communication/SessionChannel';
import { useToast } from '../../providers/toast/useToast';
import { ToastContentProps } from '../../providers/toast/context/ToastContext';
import { AlertTitle } from '@material-ui/lab';
import Link from '@material-ui/core/Link';


export interface SignupFormProps {
    formClassName: string;
}

interface SignupFormData extends MutationRegisterArgs {
    passwordConfirmation: string;
}

export function SignupForm({ formClassName }: SignupFormProps): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const validationSchema = useSignupFormValidationSchema(t);
    const handleSubmit = useSignupFormSubmitHandler(t);

    return (
        <Formik<SignupFormData>
            initialValues={{
                name: '',
                email: '',
                password: '',
                passwordConfirmation: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            <Form className={classNames('signup-form', formClassName)}>

                <FormikTextField
                    id={'signup-name-input'}
                    aria-label={t('form.name.ariaLabel')}
                    name='name'
                    type='text'
                    label={t('form.name.label')}
                    autoComplete='name'
                    fullWidth
                />

                <FormikTextField
                    id={'signup-email-input'}
                    aria-label={t('form.email.ariaLabel')}
                    name='email'
                    type='email'
                    label={t('form.email.label')}
                    autoComplete='email'
                    fullWidth
                />

                <FormikPasswordField
                    id={'signup-password-input'}
                    aria-label={t('signupPage.passwordAriaLabel')}
                    name='password'
                    label={t('form.password.label')}
                    autoComplete='new-password'
                    fullWidth
                />

                <FormikPasswordField
                    id={'signup-password-confirmation-input'}
                    aria-label={t('signupPage.passwordConfirmationAriaLabel')}
                    name='passwordConfirmation'
                    label={t('signupPage.passwordConfirmationLabel')}
                    autoComplete='new-password'
                    fullWidth
                />

                <FormikSubmitButton
                    className={classes.submit}
                    fullWidth
                >
                    {t('signupPage.signUp')}
                </FormikSubmitButton>

            </Form>
        </Formik>
    );
}


/**
 * Validation schema
 */
function useSignupFormValidationSchema(t: TFunction) {
    return React.useMemo(() => Yup.object<SignupFormData>({
        name: createNameSchema(t),
        email: createEmailSchema(t),
        password: createPasswordSchema(t),
        passwordConfirmation: createPasswordConfirmationSchema(t),
    }).defined(), [ t ]);
}


/**
 * Submit handler
 */
function useSignupFormSubmitHandler(t: TFunction) {
    const { successToast, errorToast } = useToast();
    const [ registerMutation ] = useRegisterMutation();

    return React.useCallback<FormikConfig<SignupFormData>['onSubmit']>(async ({ passwordConfirmation: _, ...values }, { setFieldError }) => {
        try {
            await registerMutation({
                variables: values,
                update: async (cache, { data }) => {
                    data && await SessionChannel.publishLoginSessionAction(data.register);
                },
            });
            const SignupSuccessToast: React.ComponentType<ToastContentProps> = ({ t }) => (
                <>
                    <AlertTitle>{t('signupPage.signupSuccessTitle')}</AlertTitle>
                    <Trans i18nKey='signupPage.signupSuccessDescription'>
                        {' '}<Link component='span'>{{ email: values.email }}</Link>{' '}
                    </Trans>
                </>
            );
            successToast(SignupSuccessToast, { disableAutoHide: true });
        } catch (error) {
            ApolloErrorHandler.process(error)
                .handleNetworkError(() => errorToast(({ t }) => t('error.networkError')))
                .handleGraphQlErrors({
                    'EMAIL_NOT_AVAILABLE': () => setFieldError('email', t('form.email.validation.notAvailable')),
                })
                .finish();
        }
    }, [ t, successToast, errorToast, registerMutation ]);
}


const useStyles = makeStyles((theme) => ({
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));
