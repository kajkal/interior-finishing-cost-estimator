import React from 'react';
import * as Yup from 'yup';
import { TFunction } from 'i18next';
import { Form, Formik, FormikConfig } from 'formik';
import { Trans, useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import InputAdornment from '@material-ui/core/InputAdornment';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import AlertTitle from '@material-ui/lab/AlertTitle';
import WarningIcon from '@material-ui/icons/Warning';
import Tooltip from '@material-ui/core/Tooltip';
import Link from '@material-ui/core/Link';

import { usePageLinearProgressRevealer } from '../../common/progress-indicators/usePageLinearProgressRevealer';
import { ChangeEmailMutationVariables, useChangeEmailMutation } from '../../../../graphql/generated-types';
import { useCurrentUserCachedData } from '../../../utils/hooks/useCurrentUserCachedData';
import { ToastContentProps } from '../../providers/toast/interfaces/ToastContentProps';
import { ApolloErrorHandler } from '../../../utils/error-handling/ApolloErrorHandler';
import { FormikSubmitButton } from '../../common/form-fields/FormikSubmitButton';
import { FormikTextField } from '../../common/form-fields/FormikTextField';
import { createEmailSchema } from '../../../utils/validation/emailSchema';
import { useToast } from '../../providers/toast/useToast';


export interface ChangeEmailFormProps {
    currentEmail: string;
    isCurrentEmailAddressConfirmed?: boolean;
}

type ChangeEmailFormData = ChangeEmailMutationVariables;

export function ChangeEmailForm({ currentEmail, isCurrentEmailAddressConfirmed }: ChangeEmailFormProps): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const validationSchema = useChangeEmailFormValidationSchema(t);
    const handleSubmit = useChangeEmailFormSubmitHandler(t);

    return (
        <Formik<ChangeEmailFormData>
            initialValues={{
                email: currentEmail,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            {({ values }) => {
                const isCurrentEmail = (values.email === currentEmail) || undefined;
                return (
                    <Form>

                        <FormikTextField
                            name='email'
                            type='email'
                            label={t('form.email.label')}
                            aria-label={t('form.email.ariaLabel')}
                            InputProps={{
                                endAdornment: isCurrentEmail && (
                                    <InputAdornment position='end'>
                                        {
                                            (isCurrentEmailAddressConfirmed)
                                                ? (
                                                    <Tooltip title={t('user.settings.emailConfirmed')!}>
                                                        <CheckCircleIcon className={classes.emailConfirmedIcon} />
                                                    </Tooltip>
                                                )
                                                : (
                                                    <Tooltip title={t('user.settings.emailNotConfirmed')!}>
                                                        <WarningIcon className={classes.emailNotConfirmedIcon} />
                                                    </Tooltip>
                                                )
                                        }
                                    </InputAdornment>
                                ),
                            }}
                            autoComplete='email'
                            fullWidth
                        />

                        <FormikSubmitButton
                            className={classes.submit}
                            disabled={isCurrentEmail}
                            variant='outlined'
                            fullWidth
                        >
                            {t('user.settings.changeEmail')}
                        </FormikSubmitButton>

                    </Form>
                );
            }}
        </Formik>
    );
}


/**
 * Validation schema
 */
function useChangeEmailFormValidationSchema(t: TFunction) {
    return React.useMemo(() => Yup.object<ChangeEmailFormData>({
        email: createEmailSchema(t),
    }).defined(), [ t ]);
}


/**
 * Submit handler
 */
function useChangeEmailFormSubmitHandler(t: TFunction) {
    const { successToast } = useToast();
    const userCachedData = useCurrentUserCachedData();
    const [ changeEmailMutation, { loading } ] = useChangeEmailMutation();
    usePageLinearProgressRevealer(loading);

    return React.useCallback<FormikConfig<ChangeEmailFormData>['onSubmit']>(async (values, { setFieldError }) => {
        if (userCachedData?.email === values.email) return;
        try {
            await changeEmailMutation({
                variables: values,
                update: (cache, { data }) => {
                    const updatedEmail = data?.changeEmail && values.email;
                    updatedEmail && cache.modify({
                        id: cache.identify({ __typename: 'User', slug: userCachedData?.slug }),
                        fields: {
                            email: () => updatedEmail,
                            isEmailAddressConfirmed: () => false,
                        },
                    });
                },
            });
            const EmailChangeSuccessToast: React.ComponentType<ToastContentProps> = ({ t }) => (
                <>
                    <AlertTitle>{t('user.settings.emailChangeSuccessTitle')}</AlertTitle>
                    <Trans i18nKey='user.settings.emailChangeSuccessDescription'>
                        {' '}<Link component='span'>{{ email: values.email }}</Link>{' '}
                    </Trans>
                </>
            );
            successToast(EmailChangeSuccessToast, { disableAutoHide: true });
        } catch (error) {
            ApolloErrorHandler.process(error)
                .handleGraphQlError('EMAIL_NOT_AVAILABLE', () => {
                    setFieldError('email', t('form.email.validation.notAvailable'));
                })
                .verifyIfAllErrorsAreHandled();
        }
    }, [ t, successToast, changeEmailMutation, userCachedData ]);
}


const useStyles = makeStyles((theme) => ({
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    emailConfirmedIcon: {
        color: theme.palette.success.main,
    },
    emailNotConfirmedIcon: {
        color: theme.palette.warning.main,
    },
}));
