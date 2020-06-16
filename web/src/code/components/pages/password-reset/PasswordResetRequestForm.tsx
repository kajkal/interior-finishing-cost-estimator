import React from 'react';
import * as Yup from 'yup';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Form, Formik, FormikConfig } from 'formik';

import { makeStyles } from '@material-ui/core/styles';

import { MutationSendPasswordResetInstructionsArgs, useSendPasswordResetInstructionsMutation } from '../../../../graphql/generated-types';
import { ButtonWithSpinner } from '../../common/progress-indicators/ButtonWithSpinner';
import { ApolloErrorHandler } from '../../providers/apollo/errors/ApolloErrorHandler';
import { FormikTextField } from '../../common/form-fields/FormikTextField';
import { createEmailSchema } from '../../../utils/validation/emailSchema';
import { useSnackbar } from '../../providers/snackbars/useSnackbar';


export interface PasswordResetRequestFormProps {
    onSuccess: (recipientEmail: string) => void;
}

type PasswordResetRequestFormData = MutationSendPasswordResetInstructionsArgs;
type PasswordResetRequestFormSubmitHandler = FormikConfig<PasswordResetRequestFormData>['onSubmit'];

export function PasswordResetRequestForm({ onSuccess }: PasswordResetRequestFormProps): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const validationSchema = usePasswordResetRequestFormValidationSchema(t);
    const handleSubmit = usePasswordResetRequestFormSubmitHandler(t, onSuccess);

    return (
        <Formik<PasswordResetRequestFormData>
            initialValues={{
                email: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            {({ isSubmitting }) => (
                <Form className='password-reset-request-form'>

                    <FormikTextField
                        id='password-reset-request-email-input'
                        aria-label={t('form.email.ariaLabel')}
                        name='email'
                        type='email'
                        label={t('form.email.label')}
                        autoComplete='email'
                        fullWidth
                    />

                    <ButtonWithSpinner
                        className={classes.submit}
                        disabled={isSubmitting}
                        isSpinning={isSubmitting}
                        fullWidth
                    >
                        {t('passwordResetPage.sendResetInstructions')}
                    </ButtonWithSpinner>

                </Form>
            )}
        </Formik>
    );
}

function usePasswordResetRequestFormValidationSchema(t: TFunction): Yup.ObjectSchema<PasswordResetRequestFormData> {
    return React.useMemo(() => Yup.object().shape<PasswordResetRequestFormData>({
        email: createEmailSchema(t),
    }), [ t ]);
}

function usePasswordResetRequestFormSubmitHandler(t: TFunction, onSuccess: (email: string) => void): PasswordResetRequestFormSubmitHandler {
    const [ sendPasswordResetInstructionsMutation ] = useSendPasswordResetInstructionsMutation();
    const { errorSnackbar } = useSnackbar();
    return React.useCallback(async (values) => {
        try {
            await sendPasswordResetInstructionsMutation({
                variables: values,
            });
            onSuccess(values.email);
        } catch (error) {
            ApolloErrorHandler.process(error)
                .handleNetworkError(() => errorSnackbar(t('error.networkError')))
                .finish();
        }
    }, [ t, errorSnackbar, sendPasswordResetInstructionsMutation, onSuccess ]);
}

const useStyles = makeStyles((theme) => ({
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));
