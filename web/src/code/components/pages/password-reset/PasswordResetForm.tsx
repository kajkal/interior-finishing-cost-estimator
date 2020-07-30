import React from 'react';
import * as Yup from 'yup';
import { DateTime } from 'luxon';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Form, Formik, FormikConfig } from 'formik';

import { makeStyles } from '@material-ui/core/styles';

import { MutationResetPasswordArgs, useResetPasswordMutation } from '../../../../graphql/generated-types';
import { usePageLinearProgressRevealer } from '../../common/progress-indicators/usePageLinearProgressRevealer';
import { createPasswordConfirmationSchema } from '../../../utils/validation/passwordConfirmationSchema';
import { ApolloErrorHandler } from '../../../utils/error-handling/ApolloErrorHandler';
import { FormikSubmitButton } from '../../common/form-fields/FormikSubmitButton';
import { FormikPasswordField } from '../../common/form-fields/FormikPasswordField';
import { createPasswordSchema } from '../../../utils/validation/passwordSchema';
import { useToast } from '../../providers/toast/useToast';
import { useNavigate } from 'react-router';
import { nav } from '../../../config/nav';


export interface PasswordResetFormProps {
    passwordResetToken: string;
}

interface PasswordResetFormData extends MutationResetPasswordArgs {
    passwordConfirmation: string;
}

export function PasswordResetForm({ passwordResetToken }: PasswordResetFormProps): React.ReactElement {
    const classes = useStyles();
    const { t, i18n } = useTranslation();
    const validationSchema = usePasswordResetFormValidationSchema(t);
    const handleSubmit = usePasswordResetFormSubmitHandler(i18n.language);

    return (
        <Formik<PasswordResetFormData>
            initialValues={{
                token: passwordResetToken,
                password: '',
                passwordConfirmation: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            {({ values }) => (
                <Form className='password-reset-form'>

                    <input type='hidden' name='token' value={values.token} />

                    <FormikPasswordField
                        aria-label={t('passwordResetPage.passwordAriaLabel')}
                        name='password'
                        label={t('passwordResetPage.passwordLabel')}
                        autoComplete='new-password'
                        fullWidth
                    />

                    <FormikPasswordField
                        aria-label={t('passwordResetPage.passwordConfirmationAriaLabel')}
                        name='passwordConfirmation'
                        label={t('passwordResetPage.passwordConfirmationLabel')}
                        autoComplete='new-password'
                        fullWidth
                    />

                    <FormikSubmitButton
                        className={classes.submit}
                        fullWidth
                    >
                        {t('passwordResetPage.resetPassword')}
                    </FormikSubmitButton>

                </Form>
            )}
        </Formik>
    );
}


/**
 * Validation schema
 */
function usePasswordResetFormValidationSchema(t: TFunction) {
    return React.useMemo(() => Yup.object<PasswordResetFormData>({
        token: Yup.string().required(),
        password: createPasswordSchema(t),
        passwordConfirmation: createPasswordConfirmationSchema(t),
    }).defined(), [ t ]);
}


/**
 * Submit handler
 */
function usePasswordResetFormSubmitHandler(locale: string) {
    const navigate = useNavigate();
    const { successToast, errorToast } = useToast();
    const [ resetPasswordMutation, { loading } ] = useResetPasswordMutation();
    usePageLinearProgressRevealer(loading);

    return React.useCallback<FormikConfig<PasswordResetFormData>['onSubmit']>(async ({ passwordConfirmation: _, ...values }) => {
        try {
            await resetPasswordMutation({ variables: values });
            successToast(({ t }) => t('passwordResetPage.passwordResetSuccess'));
            navigate(nav.login(), { replace: true });
        } catch (error) {
            ApolloErrorHandler.process(error)
                .handleGraphQlError('EXPIRED_PASSWORD_RESET_TOKEN', ({ extensions }) => {
                    const { expiredAt = new Date().toISOString() } = extensions || {};
                    const formattedExpirationDate = DateTime.fromISO(expiredAt).setLocale(locale).toLocaleString(DateTime.DATETIME_SHORT);
                    errorToast(({ t }) => t('passwordResetPage.expiredPasswordResetToken', { date: formattedExpirationDate }));
                    navigate(nav.forgotPassword(), { replace: true });
                })
                .handleGraphQlError('INVALID_PASSWORD_RESET_TOKEN', () => {
                    errorToast(({ t }) => t('passwordResetPage.invalidPasswordResetToken'));
                    navigate(nav.forgotPassword(), { replace: true });
                })
                .verifyIfAllErrorsAreHandled();
        }
    }, [ locale, navigate, successToast, errorToast, resetPasswordMutation ]);
}


const useStyles = makeStyles((theme) => ({
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));
