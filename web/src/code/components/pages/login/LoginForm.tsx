import React from 'react';
import * as Yup from 'yup';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Form, Formik, FormikConfig } from 'formik';
import { LocationDescriptorObject } from 'history';
import { useHistory, useLocation } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';

import { MutationLoginArgs, useLoginMutation } from '../../../../graphql/generated-types';
import { FormikSubmitButton } from '../../common/form-fields/FormikSubmitButton';
import { ApolloErrorHandler } from '../../providers/apollo/errors/ApolloErrorHandler';
import { FormikPasswordField } from '../../common/form-fields/FormikPasswordField';
import { SessionStateManager } from '../../providers/apollo/cache/session/SessionStateManager';
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

type LoginFormData = MutationLoginArgs;
type LoginFormSubmitHandler = FormikConfig<LoginFormData>['onSubmit'];

export function LoginForm(props: LoginFormProps): React.ReactElement {
    const { t } = useTranslation();
    const { formClassName } = props;
    const classes = useStyles();

    const { errorSnackbar } = useSnackbar();
    const [ loginMutation ] = useLoginMutation();
    const { push } = useHistory();
    const { state = { from: { pathname: routes.projects() } } } = useLocation<LoginLocationState>();

    const validationSchema = React.useMemo(() => Yup.object<LoginFormData>({
        email: createEmailSchema(t),
        password: createPasswordSchema(t),
    }).defined(), [ t ]);

    const handleSubmit = React.useCallback<LoginFormSubmitHandler>(async (values) => {
        try {
            await loginMutation({
                variables: values,
                update: (cache, { data }) => {
                    data && SessionStateManager.handleAccessMutationResponse(cache, data.login);
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

const useStyles = makeStyles((theme) => ({
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));
