import React from 'react';
import * as Yup from 'yup';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Form, Formik, FormikConfig } from 'formik';

import { makeStyles } from '@material-ui/core/styles';

import { ChangePasswordMutationVariables, useChangePasswordMutation } from '../../../../graphql/generated-types';
import { usePageLinearProgressRevealer } from '../../common/progress-indicators/usePageLinearProgressRevealer';
import { useCurrentUserCachedData } from '../../../utils/hooks/useCurrentUserCachedData';
import { ApolloErrorHandler } from '../../../utils/error-handling/ApolloErrorHandler';
import { FormikPasswordField } from '../../common/form-fields/FormikPasswordField';
import { isEqualTo } from '../../../utils/validation/customAssertingTestFunctions';
import { FormikSubmitButton } from '../../common/form-fields/FormikSubmitButton';
import { createPasswordSchema } from '../../../utils/validation/passwordSchema';
import { useToast } from '../../providers/toast/useToast';


interface ChangePasswordFormData extends ChangePasswordMutationVariables {
    email: string;
    newPasswordConfirmation: string;
}

export function ChangePasswordForm(): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const userCachedData = useCurrentUserCachedData();
    const validationSchema = useChangePasswordFormValidationSchema(t);
    const handleSubmit = useChangePasswordFormSubmitHandler(t);

    return (
        <Formik<ChangePasswordFormData>
            initialValues={{
                email: userCachedData?.email || '',
                currentPassword: '',
                newPassword: '',
                newPasswordConfirmation: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            {({ values }) => (
                <Form>

                    {/* for password managers */}
                    <input
                        type='email'
                        name='email'
                        autoComplete='email'
                        value={values.email}
                        readOnly
                        className={classes.hiddenEmailFieldForSakeOfAccessibility}
                    />

                    <FormikPasswordField
                        name='currentPassword'
                        autoComplete='current-password'
                        label={t('form.currentPassword.label')}
                        aria-label={t('form.currentPassword.ariaLabel')}
                        fullWidth
                    />

                    <FormikPasswordField
                        name='newPassword'
                        autoComplete='new-password'
                        label={t('form.newPassword.label')}
                        aria-label={t('form.newPassword.ariaLabel')}
                        fullWidth
                    />

                    <FormikPasswordField
                        name='newPasswordConfirmation'
                        autoComplete='new-password'
                        label={t('form.newPasswordConfirmation.label')}
                        aria-label={t('form.newPasswordConfirmation.ariaLabel')}
                        fullWidth
                    />

                    <FormikSubmitButton
                        className={classes.submit}
                        variant='outlined'
                        fullWidth
                    >
                        {t('user.settings.changePassword')}
                    </FormikSubmitButton>

                </Form>
            )}
        </Formik>
    );
}


/**
 * Validation schema
 */
function useChangePasswordFormValidationSchema(t: TFunction) {
    return React.useMemo(() => Yup.object<ChangePasswordFormData>({
        email: Yup.string().required(),
        currentPassword: createPasswordSchema(t),
        newPassword: createPasswordSchema(t),
        newPasswordConfirmation: Yup.string()
            .test('match', t('form.newPasswordConfirmation.validation.passwordsNotMatch'), isEqualTo('newPassword')),
    }).defined(), [ t ]);
}


/**
 * Submit handler
 */
function useChangePasswordFormSubmitHandler(t: TFunction) {
    const { successToast } = useToast();
    const [ changePasswordMutation, { loading } ] = useChangePasswordMutation();
    usePageLinearProgressRevealer(loading);

    return React.useCallback<FormikConfig<ChangePasswordFormData>['onSubmit']>(async ({ email, newPasswordConfirmation, ...values }, { setFieldError, resetForm }) => {
        try {
            await changePasswordMutation({ variables: values });
            successToast(({ t }) => t('user.settings.passwordChangeSuccess'));
            resetForm();
        } catch (error) {
            ApolloErrorHandler.process(error)
                .handleGraphQlError('INVALID_CURRENT_PASSWORD', () => {
                    setFieldError('currentPassword', t('user.settings.incorrectCurrentPassword'));
                })
                .verifyIfAllErrorsAreHandled();
        }
    }, [ t, successToast, changePasswordMutation ]);
}


const useStyles = makeStyles((theme) => ({
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    hiddenEmailFieldForSakeOfAccessibility: {
        display: 'none',
    }
}));

