import React from 'react';
import * as Yup from 'yup';
import { DateTime } from 'luxon';
import { TFunction } from 'i18next';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Form, Formik, FormikConfig } from 'formik';

import { makeStyles } from '@material-ui/core/styles';

import { MutationResetPasswordArgs, useResetPasswordMutation } from '../../../../graphql/generated-types';
import { createPasswordConfirmationSchema } from '../../../utils/validation/passwordConfirmationSchema';
import { FormikSubmitButton } from '../../common/form-fields/FormikSubmitButton';
import { ApolloErrorHandler } from '../../providers/apollo/errors/ApolloErrorHandler';
import { FormikPasswordField } from '../../common/form-fields/FormikPasswordField';
import { createPasswordSchema } from '../../../utils/validation/passwordSchema';
import { useToast } from '../../providers/toast/useToast';
import { routes } from '../../../config/routes';


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
                        id={'password-reset-password-input'}
                        aria-label={t('passwordResetPage.passwordAriaLabel')}
                        name='password'
                        label={t('passwordResetPage.passwordLabel')}
                        autoComplete='new-password'
                        fullWidth
                    />

                    <FormikPasswordField
                        id={'password-reset-password-confirmation-input'}
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
    const { replace } = useHistory();
    const { successToast, errorToast } = useToast();
    const [ resetPasswordMutation ] = useResetPasswordMutation();

    return React.useCallback<FormikConfig<PasswordResetFormData>['onSubmit']>(async ({ passwordConfirmation: _, ...values }) => {
        try {
            await resetPasswordMutation({ variables: values });
            successToast(({ t }) => t('passwordResetPage.passwordResetSuccess'));
            replace(routes.login());
        } catch (error) {
            ApolloErrorHandler.process(error)
                .handleNetworkError(() => errorToast(({ t }) => t('error.networkError')))
                .handleGraphQlErrors({
                    'EXPIRED_PASSWORD_RESET_TOKEN': ({ extensions }) => {
                        const { expiredAt = new Date().toISOString() } = extensions || {};
                        const formattedExpirationDate = DateTime.fromISO(expiredAt).setLocale(locale).toLocaleString(DateTime.DATETIME_SHORT);
                        errorToast(({ t }) => t('passwordResetPage.expiredPasswordResetToken', { date: formattedExpirationDate }));
                        replace(routes.forgotPassword());
                    },
                    'INVALID_PASSWORD_RESET_TOKEN': () => {
                        errorToast(({ t }) => t('passwordResetPage.invalidPasswordResetToken'));
                        replace(routes.forgotPassword());
                    },
                })
                .finish();
        }
    }, [ locale, replace, successToast, errorToast, resetPasswordMutation ]);
}


const useStyles = makeStyles((theme) => ({
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));
