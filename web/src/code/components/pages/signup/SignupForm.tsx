import React from 'react';
import * as Yup from 'yup';
import classNames from 'classnames';
import { ApolloError } from 'apollo-boost';
import { useHistory } from 'react-router-dom';
import { Form, Formik, FormikConfig } from 'formik';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import { MeDocument, MeQuery, RegisterFormData, useRegisterMutation } from '../../../../graphql/generated-types';
import { FormikPasswordField } from '../../common/form-fields/FormikPasswordField';
import { FormikTextField } from '../../common/form-fields/FormikTextField';
import { passwordSchema } from '../../../validation/passwordSchema';
import { authService } from '../../../services/auth/AuthService';
import { emailSchema } from '../../../validation/emailSchema';
import { nameSchema } from '../../../validation/nameSchema';
import { useSnackbar } from '../../snackbars/useSnackbar';
import { routes } from '../../../config/routes';


export interface SignupFormProps {
    formClassName: string;
}

interface ExtendedSignupFormData extends RegisterFormData {
    passwordConfirmation: string;
}

type SignupFormSubmitHandler = FormikConfig<ExtendedSignupFormData>['onSubmit'];

export function SignupForm(props: SignupFormProps): React.ReactElement {
    const { formClassName } = props;
    const classes = useStyles();

    const { successSnackbar, errorSnackbar } = useSnackbar();
    const [ registerMutation ] = useRegisterMutation();
    const { push } = useHistory();

    const handleSubmit: SignupFormSubmitHandler = React.useCallback(async ({ passwordConfirmation: _, ...values }, { setFieldError }) => {
        try {
            const response = await registerMutation({
                variables: { data: values },
                update: (cache, { data }) => {
                    data && cache.writeQuery<MeQuery>({
                        query: MeDocument,
                        data: {
                            me: data.register.user,
                        },
                    });
                },
            });
            successSnackbar('register success!');
            authService.setAccessToken(response.data?.register.accessToken);
            push(routes.projects());
        } catch (error) {
            if (error instanceof ApolloError) {
                if (error.graphQLErrors) {
                    if (error.graphQLErrors[ 0 ]?.message === 'EMAIL_NOT_AVAILABLE') {
                        setFieldError('email', 'Email not available');
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
        <Formik<ExtendedSignupFormData>
            initialValues={{
                name: '',
                email: '',
                password: '',
                passwordConfirmation: '',
            }}
            validationSchema={signupFormDataSchema}
            onSubmit={handleSubmit}
        >
            {({ isSubmitting }) => (
                <Form className={classNames('signup-form', formClassName)}>

                    <FormikTextField
                        id={'signup-name-input'}
                        aria-label={'Enter your username'}
                        name='name'
                        type='text'
                        label='Name'
                        autoComplete='name'
                        fullWidth
                    />

                    <FormikTextField
                        id={'signup-email-input'}
                        aria-label={'Enter your email address'}
                        name='email'
                        type='email'
                        label='Email address'
                        autoComplete='email'
                        fullWidth
                    />

                    <FormikPasswordField
                        id={'signup-password-input'}
                        aria-label={'Create a secure password'}
                        name='password'
                        label='Password'
                        autoComplete='new-password'
                        fullWidth
                    />

                    <FormikPasswordField
                        id={'signup-password-confirmation-input'}
                        aria-label={'Confirm your password'}
                        name='passwordConfirmation'
                        label='Confirm Password'
                        autoComplete='new-password'
                        fullWidth
                    />

                    <Button
                        className={classes.submit}
                        disabled={isSubmitting}
                        type='submit'
                        variant='contained'
                        color='primary'
                        fullWidth
                    >
                        Sign up
                    </Button>

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

export const signupFormDataSchema = Yup.object().shape<ExtendedSignupFormData>({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    passwordConfirmation: Yup.string()
        .test('match',
            'Passwords do not match',
            function (passwordConfirmation: string) {
                return passwordConfirmation === this.parent.password;
            }),
});
