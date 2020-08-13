import React from 'react';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Form, Formik, FormikConfig } from 'formik';

import { makeStyles } from '@material-ui/core/styles';

import { ChangeProfileSettingsMutationVariables, useChangeProfileSettingsMutation, UserDetailedDataFragment } from '../../../../graphql/generated-types';
import { usePageLinearProgressRevealer } from '../../common/progress-indicators/usePageLinearProgressRevealer';
import { useCurrentUserCachedData } from '../../../utils/hooks/useCurrentUserCachedData';
import { ApolloErrorHandler } from '../../../utils/error-handling/ApolloErrorHandler';
import { FormikCheckbox } from '../../common/form-fields/checkbox/FormikCheckbox';
import { FormikSubmitButton } from '../../common/form-fields/FormikSubmitButton';
import { useToast } from '../../providers/toast/useToast';


type ChangeProfileSettingsFormData = ChangeProfileSettingsMutationVariables;

export function ChangeProfileSettingsForm(): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const userCachedData = useCurrentUserCachedData();
    const validationSchema = useChangeProfileSettingsFormValidationSchema();
    const handleSubmit = useChangeProfileSettingsFormSubmitHandler(userCachedData);

    return (
        <Formik<ChangeProfileSettingsFormData>
            initialValues={{
                hidden: userCachedData?.hidden || false,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            {({ values, initialValues }) => {
                const inInitialState = areValuesEqInitialValues(values, initialValues);
                return (
                    <Form>

                        <FormikCheckbox
                            name='hidden'
                            label={t('user.settings.profileModeLabel')}
                        />

                        <FormikSubmitButton
                            className={classes.submit}
                            variant='outlined'
                            disabled={inInitialState}
                            fullWidth
                        >
                            {t('user.settings.changeProfileSettings')}
                        </FormikSubmitButton>

                    </Form>
                );
            }}
        </Formik>
    );
}


function areValuesEqInitialValues(values: ChangeProfileSettingsFormData, initialValues: ChangeProfileSettingsFormData): boolean {
    return (values.hidden === initialValues.hidden);
}


/**
 * Validation schema
 */
function useChangeProfileSettingsFormValidationSchema() {
    return React.useMemo(() => Yup.object<ChangeProfileSettingsFormData>({
        hidden: Yup.boolean().required(),
    }).defined(), []);
}


/**
 * Submit handler
 */
function useChangeProfileSettingsFormSubmitHandler(userCachedData?: UserDetailedDataFragment) {
    const { successToast } = useToast();
    const [ changeProfileSettingsMutation, { loading } ] = useChangeProfileSettingsMutation();
    usePageLinearProgressRevealer(loading);

    return React.useCallback<FormikConfig<ChangeProfileSettingsFormData>['onSubmit']>(async (values) => {
        if (userCachedData?.hidden === values.hidden) return;
        try {
            await changeProfileSettingsMutation({
                variables: values,
                update: (cache, { data }) => {
                    const isSuccess = data?.changeProfileSettings;
                    isSuccess && cache.modify({
                        id: cache.identify({ __typename: 'User', slug: userCachedData?.slug }),
                        fields: {
                            hidden: () => values.hidden,
                        },
                    });
                },
            });
            successToast(({ t }) => t('user.settings.profileSettingsChangeSuccess'));
        } catch (error) {
            ApolloErrorHandler.process(error).verifyIfAllErrorsAreHandled();
        }
    }, [ successToast, userCachedData, changeProfileSettingsMutation ]);
}


const useStyles = makeStyles((theme) => ({
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));
