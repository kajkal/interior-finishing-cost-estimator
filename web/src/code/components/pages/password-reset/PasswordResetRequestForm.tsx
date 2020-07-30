import React from 'react';
import * as Yup from 'yup';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Form, Formik, FormikConfig } from 'formik';

import { makeStyles } from '@material-ui/core/styles';

import { MutationSendPasswordResetInstructionsArgs, useSendPasswordResetInstructionsMutation } from '../../../../graphql/generated-types';
import { usePageLinearProgressRevealer } from '../../common/progress-indicators/usePageLinearProgressRevealer';
import { ApolloErrorHandler } from '../../../utils/error-handling/ApolloErrorHandler';
import { FormikSubmitButton } from '../../common/form-fields/FormikSubmitButton';
import { FormikTextField } from '../../common/form-fields/FormikTextField';
import { createEmailSchema } from '../../../utils/validation/emailSchema';


export interface PasswordResetRequestFormProps {
    onSuccess: (recipientEmail: string) => void;
}

type PasswordResetRequestFormData = MutationSendPasswordResetInstructionsArgs;

export function PasswordResetRequestForm({ onSuccess }: PasswordResetRequestFormProps): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const validationSchema = usePasswordResetRequestFormValidationSchema(t);
    const handleSubmit = usePasswordResetRequestFormSubmitHandler(onSuccess);

    return (
        <Formik<PasswordResetRequestFormData>
            initialValues={{
                email: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            <Form className='password-reset-request-form'>

                <FormikTextField
                    aria-label={t('form.email.ariaLabel')}
                    name='email'
                    type='email'
                    label={t('form.email.label')}
                    autoComplete='email'
                    fullWidth
                />

                <FormikSubmitButton
                    className={classes.submit}
                    fullWidth
                >
                    {t('passwordResetPage.sendResetInstructions')}
                </FormikSubmitButton>

            </Form>
        </Formik>
    );
}


/**
 * Validation schema
 */
function usePasswordResetRequestFormValidationSchema(t: TFunction) {
    return React.useMemo(() => Yup.object<PasswordResetRequestFormData>({
        email: createEmailSchema(t),
    }).defined(), [ t ]);
}


/**
 * Submit handler
 */
function usePasswordResetRequestFormSubmitHandler(onSuccess: (email: string) => void) {
    const [ sendPasswordResetInstructionsMutation, { loading } ] = useSendPasswordResetInstructionsMutation();
    usePageLinearProgressRevealer(loading);

    return React.useCallback<FormikConfig<PasswordResetRequestFormData>['onSubmit']>(async (values) => {
        try {
            await sendPasswordResetInstructionsMutation({ variables: values });
            onSuccess(values.email);
        } catch (error) {
            ApolloErrorHandler.process(error).verifyIfAllErrorsAreHandled();
        }
    }, [ onSuccess, sendPasswordResetInstructionsMutation ]);
}


const useStyles = makeStyles((theme) => ({
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));
