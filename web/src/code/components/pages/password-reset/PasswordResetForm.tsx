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
import { useSnackbar } from '../../providers/snackbars/useSnackbar';
import { routes } from '../../../config/routes';


export interface PasswordResetFormProps {
    passwordResetToken: string;
}

interface PasswordResetFormData extends MutationResetPasswordArgs {
    passwordConfirmation: string;
}
type PasswordResetFormSubmitHandler = FormikConfig<PasswordResetFormData>['onSubmit'];

export function PasswordResetForm({ passwordResetToken }: PasswordResetFormProps): React.ReactElement {
    const classes = useStyles();
    const { t, i18n } = useTranslation();
    const validationSchema = usePasswordResetFormValidationSchema(t);
    const handleSubmit = usePasswordResetFormSubmitHandler(t, passwordResetToken, i18n.language);

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

function usePasswordResetFormValidationSchema(t: TFunction): Yup.ObjectSchema<PasswordResetFormData> {
    return React.useMemo(() => Yup.object<PasswordResetFormData>({
        token: Yup.string().required(),
        password: createPasswordSchema(t),
        passwordConfirmation: createPasswordConfirmationSchema(t),
    }).defined(), [ t ]);
}

function usePasswordResetFormSubmitHandler(t: TFunction, passwordResetToken: string, locale: string): PasswordResetFormSubmitHandler {
    const [ resetPasswordMutation ] = useResetPasswordMutation();
    const { successSnackbar, errorSnackbar } = useSnackbar();
    const { replace } = useHistory();
    return React.useCallback(async ({ passwordConfirmation: _, ...values }) => {
        try {
            await resetPasswordMutation({ variables: values });
            successSnackbar(t('passwordResetPage.passwordResetSuccess'));
            replace(routes.login());
        } catch (error) {
            ApolloErrorHandler.process(error)
                .handleNetworkError(() => errorSnackbar(t('error.networkError')))
                .handleGraphQlErrors({
                    'EXPIRED_PASSWORD_RESET_TOKEN': ({ extensions }) => {
                        const { expiredAt = new Date().toISOString() } = extensions || {};
                        const formattedExpirationDate = DateTime.fromISO(expiredAt).setLocale(locale).toLocaleString(DateTime.DATETIME_SHORT);
                        errorSnackbar(t('passwordResetPage.expiredPasswordResetToken', { date: formattedExpirationDate }));
                        replace(routes.forgotPassword());
                    },
                    'INVALID_PASSWORD_RESET_TOKEN': () => {
                        errorSnackbar(t('passwordResetPage.invalidPasswordResetToken'));
                        replace(routes.forgotPassword());
                    },
                })
                .finish();
        }
    }, [ t, errorSnackbar, resetPasswordMutation, passwordResetToken ]);
}

const useStyles = makeStyles((theme) => ({
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));
