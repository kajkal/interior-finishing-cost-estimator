import React from 'react';
import * as Yup from 'yup';
import classNames from 'classnames';
import { Form, Formik, FormikConfig } from 'formik';
import { ApolloError } from 'apollo-boost';
import { LocationDescriptorObject } from 'history';
import { useHistory, useLocation } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';

import { LoginFormData, MeDocument, MeQuery, useLoginMutation } from '../../../../graphql/generated-types';
import { ButtonWithSpinner } from '../../common/progress-indicators/ButtonWithSpinner';
import { FormikPasswordField } from '../../common/form-fields/FormikPasswordField';
import { FormikTextField } from '../../common/form-fields/FormikTextField';
import { passwordSchema } from '../../../validation/passwordSchema';
import { emailSchema } from '../../../validation/emailSchema';
import { authService } from '../../../services/auth/AuthService';
import { useSnackbar } from '../../snackbars/useSnackbar';
import { routes } from '../../../config/routes';


export interface LoginFormProps {
    formClassName: string;
}

interface LoginLocationState {
    from: LocationDescriptorObject;
}

type LoginFormSubmitHandler = FormikConfig<LoginFormData>['onSubmit'];

export function LoginForm(props: LoginFormProps): React.ReactElement {
    const { formClassName } = props;
    const classes = useStyles();

    const { successSnackbar, errorSnackbar } = useSnackbar();
    const [ loginMutation ] = useLoginMutation();
    const { push } = useHistory();
    const { state = { from: { pathname: routes.projects() } } } = useLocation<LoginLocationState>();

    const handleSubmit: LoginFormSubmitHandler = React.useCallback(async (values) => {
        try {
            const response = await loginMutation({
                variables: { data: values },
                update: (cache, { data }) => {
                    data && cache.writeQuery<MeQuery>({
                        query: MeDocument,
                        data: {
                            me: data.login.user,
                        },
                    });
                },
            });
            successSnackbar('login success!');
            authService.setAccessToken(response.data?.login.accessToken);
            push(state.from);
        } catch (error) {
            console.log('FORM ERROR', {graphql: error.graphQLErrors, network: error.networkError});
            if (error instanceof ApolloError) {
                if (error.graphQLErrors) {
                    if (error.graphQLErrors[ 0 ]?.message === 'BAD_CREDENTIALS') {
                        errorSnackbar('Bad email or password');
                    }
                }
                if (error.networkError) {
                    errorSnackbar('Network error');
                    console.error(error.networkError);
                }
            } else {
                errorSnackbar('An unexpected error occurred');
                console.error(error);
            }
        }
    }, []);

    return (
        <Formik<LoginFormData>
            initialValues={{
                email: '',
                password: '',
            }}
            validationSchema={loginFormDataSchema}
            onSubmit={handleSubmit}
        >
            {({ isSubmitting }) => (
                <Form className={classNames('login-form', formClassName)}>

                    <FormikTextField
                        id={'login-email-input'}
                        aria-label={'Enter your email address'}
                        name='email'
                        type='email'
                        label='Email address'
                        autoComplete='email'
                        fullWidth
                    />

                    <FormikPasswordField
                        id={'login-password-input'}
                        aria-label={'Enter your password'}
                        name='password'
                        label='Password'
                        autoComplete='current-password'
                        fullWidth
                    />

                    <ButtonWithSpinner
                        className={classes.submit}
                        disabled={isSubmitting}
                        isSpinning={isSubmitting}
                        fullWidth
                    >
                        {'Log in'}
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

export const loginFormDataSchema = Yup.object().shape<LoginFormData>({
    email: emailSchema,
    password: passwordSchema,
});
