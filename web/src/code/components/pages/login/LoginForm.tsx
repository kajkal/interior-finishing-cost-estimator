import React from 'react';
import * as Yup from 'yup';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Form, Formik, FormikConfig } from 'formik';
import { LocationDescriptorObject } from 'history';
import { useHistory, useLocation } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';

import { LoginFormData, useLoginMutation } from '../../../../graphql/generated-types';
import { ButtonWithSpinner } from '../../common/progress-indicators/ButtonWithSpinner';
import { ApolloErrorHandler } from '../../providers/apollo/errors/ApolloErrorHandler';
import { FormikPasswordField } from '../../common/form-fields/FormikPasswordField';
import { ApolloCacheManager } from '../../providers/apollo/ApolloCacheManager';
import { FormikTextField } from '../../common/form-fields/FormikTextField';
import { useSnackbar } from '../../providers/snackbars/useSnackbar';
import { createPasswordSchema } from '../../../utils/validation/passwordSchema';
import { createEmailSchema } from '../../../utils/validation/emailSchema';
import { routes } from '../../../config/routes';


export interface LoginFormProps {
    formClassName: string;
}

interface LoginLocationState {
    from: LocationDescriptorObject;
}

type LoginFormSubmitHandler = FormikConfig<LoginFormData>['onSubmit'];

export function LoginForm(props: LoginFormProps): React.ReactElement {
    const { t } = useTranslation();
    const { formClassName } = props;
    const classes = useStyles();

    const { errorSnackbar } = useSnackbar();
    const [ loginMutation ] = useLoginMutation();
    const { push } = useHistory();
    const { state = { from: { pathname: routes.projects() } } } = useLocation<LoginLocationState>();

    const validationSchema = React.useMemo(() => Yup.object().shape<LoginFormData>({
        email: createEmailSchema(t),
        password: createPasswordSchema(t),
    }), [ t ]);

    const handleSubmit = React.useCallback<LoginFormSubmitHandler>(async (values) => {
        try {
            await loginMutation({
                variables: { data: values },
                update: (cache, { data }) => {
                    data && ApolloCacheManager.handleAccessMutationResponse(cache, data.login);
                },
            });
            push(state.from);
        } catch (error) {
            ApolloErrorHandler.process(error)
                .handleNetworkError(() => errorSnackbar(t('error.networkError')))
                .handleGraphQlErrors({
                    'BAD_CREDENTIALS': () => errorSnackbar(t('loginPage.badCredentials')),
                })
                .finish();
        }
    }, []);

    return (
        <Formik<LoginFormData>
            initialValues={{
                email: '',
                password: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            {({ isSubmitting }) => (
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

                    <ButtonWithSpinner
                        className={classes.submit}
                        disabled={isSubmitting}
                        isSpinning={isSubmitting}
                        fullWidth
                    >
                        {t('loginPage.logIn')}
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
