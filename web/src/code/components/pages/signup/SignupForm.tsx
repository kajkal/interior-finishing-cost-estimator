import React from 'react';
import * as Yup from 'yup';
import classNames from 'classnames';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Form, Formik, FormikConfig } from 'formik';

import { makeStyles } from '@material-ui/core/styles';

import { MutationRegisterArgs, useRegisterMutation } from '../../../../graphql/generated-types';
import { ButtonWithSpinner } from '../../common/progress-indicators/ButtonWithSpinner';
import { ApolloErrorHandler } from '../../providers/apollo/errors/ApolloErrorHandler';
import { FormikPasswordField } from '../../common/form-fields/FormikPasswordField';
import { ApolloCacheManager } from '../../providers/apollo/ApolloCacheManager';
import { FormikTextField } from '../../common/form-fields/FormikTextField';
import { useSnackbar } from '../../providers/snackbars/useSnackbar';
import { createPasswordSchema } from '../../../utils/validation/passwordSchema';
import { createEmailSchema } from '../../../utils/validation/emailSchema';
import { createNameSchema } from '../../../utils/validation/nameSchema';
import { routes } from '../../../config/routes';


export interface SignupFormProps {
    formClassName: string;
}

interface SignupFormData extends MutationRegisterArgs {
    passwordConfirmation: string;
}
type SignupFormSubmitHandler = FormikConfig<SignupFormData>['onSubmit'];

export function SignupForm(props: SignupFormProps): React.ReactElement {
    const { t } = useTranslation();
    const { formClassName } = props;
    const classes = useStyles();

    const { successSnackbar, errorSnackbar } = useSnackbar();
    const [ registerMutation ] = useRegisterMutation();
    const { push } = useHistory();

    const validationSchema = React.useMemo(() => Yup.object().shape<SignupFormData>({
        name: createNameSchema(t),
        email: createEmailSchema(t),
        password: createPasswordSchema(t),
        passwordConfirmation: Yup.string()
            .test('match', t('form.password.validation.passwordsNotMatch'),
                function (passwordConfirmation: string) {
                    return passwordConfirmation === this.parent.password;
                }),
    }), [ t ]);

    const handleSubmit = React.useCallback<SignupFormSubmitHandler>(async ({ passwordConfirmation: _, ...values }, { setFieldError }) => {
        try {
            await registerMutation({
                variables: values,
                update: (cache, { data }) => {
                    data && ApolloCacheManager.handleAccessMutationResponse(cache, data.register);
                },
            });
            successSnackbar('register success!'); // TODO
            push(routes.projects());
        } catch (error) {
            ApolloErrorHandler.process(error)
                .handleNetworkError(() => errorSnackbar(t('error.networkError')))
                .handleGraphQlErrors({
                    'EMAIL_NOT_AVAILABLE': () => setFieldError('email', t('form.email.validation.notAvailable')),
                })
                .finish();
        }
    }, []);

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
            {({ isSubmitting }) => (
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

                    <ButtonWithSpinner
                        className={classes.submit}
                        disabled={isSubmitting}
                        isSpinning={isSubmitting}
                        fullWidth
                    >
                        {t('signupPage.signUp')}
                    </ButtonWithSpinner>

                    {/*<div>*/}
                    {/*    <pre>*/}
                    {/*        {JSON.stringify(values, null, 2)}*/}
                    {/*    </pre>*/}
                    {/*    <pre>*/}
                    {/*        {JSON.stringify(errors, null, 2)}*/}
                    {/*    </pre>*/}
                    {/*</div>*/}

                </Form>
            )}
        </Formik>
    );
}

const useStyles = makeStyles((theme) => ({
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));
