import React from 'react';
import * as Yup from 'yup';
import { TFunction } from 'i18next';
import { useRecoilState } from 'recoil/dist';
import { useTranslation } from 'react-i18next';
import { Form, Formik, FormikConfig } from 'formik';
import { SlateDocument } from '@udecode/slate-plugins';

import { makeStyles } from '@material-ui/core/styles';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';

import { MeDocument, MeQuery, ProfileDocument, ProfileQuery, UserDetailedDataFragment, useUpdateProfileMutation } from '../../../../graphql/generated-types';
import { usePageLinearProgressRevealer } from '../../common/progress-indicators/usePageLinearProgressRevealer';
import { FormikRichTextEditor } from '../../common/form-fields/ritch-text-editor/FormikRichTextEditor';
import { FormikLocationField } from '../../common/form-fields/location/FormikLocationField';
import { mapLocationOptionToLocationFormData } from '../../../utils/mappers/locationMapper';
import { useModalNavigationBlocker } from '../../../utils/hooks/useModalNavigationBlocker';
import { FormikDropzoneArea } from '../../common/form-fields/dropzone/FormikDropzoneArea';
import { isSlateDocumentNotEmpty } from '../../../utils/validation/richTestEditorSchema';
import { ProfileUpdateFormData, profileUpdateModalAtom } from './profileUpdateModalAtom';
import { useCurrentUserCachedData } from '../../../utils/hooks/useCurrentUserCachedData';
import { ApolloErrorHandler } from '../../../utils/error-handling/ApolloErrorHandler';
import { emptyEditorValue } from '../../common/form-fields/ritch-text-editor/options';
import { FormikSubmitButton } from '../../common/form-fields/FormikSubmitButton';
import { LocationOption } from '../../common/form-fields/location/LocationField';
import { FormikTextField } from '../../common/form-fields/FormikTextField';
import { createNameSchema } from '../../../utils/validation/nameSchema';
import { ResponsiveModalProps } from '../ResponsiveModalProps';


export function ProfileUpdateModal({ isMobile }: ResponsiveModalProps): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const [ { open, withExistingAvatar, profileData }, setModalState ] = useRecoilState(profileUpdateModalAtom);

    const handleModalClose = React.useCallback(() => {
        setModalState((prevState) => ({ ...prevState, open: false }));
    }, [ setModalState ]);

    const validationSchema = useProfileUpdateFormValidationSchema(t);
    const handleSubmit = useProfileUpdateFormSubmitHandler(handleModalClose, withExistingAvatar);

    useModalNavigationBlocker(handleModalClose, open);
    const titleId = 'profile-update-modal-title';

    return (
        <Dialog
            fullScreen={isMobile}
            open={open}
            onClose={handleModalClose}
            aria-labelledby={titleId}
            classes={{ paperWidthSm: classes.paperWidthSmPlus }}
            fullWidth
        >
            <DialogTitle id={titleId}>
                {t('user.updateProfileModal.title')}
            </DialogTitle>

            <Formik<ProfileUpdateFormData>
                initialValues={{
                    name: profileData?.name || '',
                    avatar: profileData?.avatar || null,
                    description: profileData?.description || emptyEditorValue,
                    location: profileData?.location || null,
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, initialValues, submitForm, resetForm }) => {
                    const inInitialState = areValuesEqInitialValues(values, initialValues);
                    return (
                        <>
                            <DialogContent>
                                <Form>

                                    <FormikTextField
                                        name='name'
                                        type='text'
                                        label={t('form.name.label')}
                                        aria-label={t('form.name.ariaLabel')}
                                        autoComplete='name'
                                        fullWidth
                                        autoFocus
                                    />

                                    <FormikDropzoneArea
                                        name='avatar'
                                        label={t('form.avatar.label')}
                                    />

                                    <FormikRichTextEditor
                                        name='description'
                                        label={t('form.profile.label')}
                                        aria-label={t('form.profile.ariaLabel')}
                                    />

                                    <FormikLocationField
                                        name='location'
                                        label={t('form.location.label')}
                                        optional
                                    />

                                </Form>

                            </DialogContent>

                            <DialogActions>
                                <Button type='button' variant='outlined' onClick={handleModalClose}>
                                    {t('form.common.cancel')}
                                </Button>
                                <Button type='button' variant='outlined' onClick={resetForm as () => void}
                                    disabled={inInitialState}>
                                    {t('form.common.reset')}
                                </Button>
                                <FormikSubmitButton type='button' onClick={submitForm} disabled={inInitialState}>
                                    {t('form.common.update')}
                                </FormikSubmitButton>
                            </DialogActions>
                        </>
                    );
                }}
            </Formik>

        </Dialog>
    );
}


function areValuesEqInitialValues(values: ProfileUpdateFormData, initialValues: ProfileUpdateFormData): boolean {
    return (values.name === initialValues.name)
        && (values.avatar === initialValues.avatar)
        && (values.description === initialValues.description)
        && (values.location?.place_id === initialValues.location?.place_id);
}


/**
 * Validation schema
 */
function useProfileUpdateFormValidationSchema(t: TFunction) {
    return React.useMemo(() => Yup.object<ProfileUpdateFormData>({
        name: createNameSchema(t),
        avatar: Yup.mixed<File>().defined(),
        description: Yup.mixed<SlateDocument>(),
        location: Yup.mixed<LocationOption>().defined(),
    }).defined(), [ t ]);
}


/**
 * Submit handler
 */
function useProfileUpdateFormSubmitHandler(onModalClose: () => void, withExistingAvatar?: boolean) {
    const userCachedData = useCurrentUserCachedData();
    const [ updateProfileMutation, { loading } ] = useUpdateProfileMutation();
    usePageLinearProgressRevealer(loading);

    return React.useCallback<FormikConfig<ProfileUpdateFormData>['onSubmit']>(async ({ name, avatar, description, location }) => {
        try {
            await updateProfileMutation({
                variables: {
                    name: (name !== userCachedData?.name) ? name : null,
                    avatar: (avatar?.size === 0) ? null : avatar,
                    removeCurrentAvatar: Boolean((withExistingAvatar && !avatar)),
                    description: isSlateDocumentNotEmpty(description) ? JSON.stringify(description) : null,
                    location: mapLocationOptionToLocationFormData(location),
                },
                update: (cache, { data }) => {
                    const updatedProfile = data?.updateProfile;
                    if (updatedProfile) {
                        cache.modify({
                            id: cache.identify({ __typename: 'User', slug: updatedProfile.userSlug }),
                            fields: {
                                avatar: () => updatedProfile.avatar,
                            },
                        });

                        // when user name (and slug) change major cache update is necessary
                        const userPrevData = userCachedData as UserDetailedDataFragment;
                        if (updatedProfile.userSlug !== userPrevData.slug) {

                            // write new profile query result to cache
                            cache.writeQuery<ProfileQuery>({
                                broadcast: false,
                                query: ProfileDocument,
                                variables: { userSlug: updatedProfile.userSlug },
                                data: { profile: updatedProfile },
                            });

                            // clear profile data with old slug (otherwise old profile cache record cannot be removed by cache.gc())
                            cache.writeQuery<ProfileQuery>({
                                broadcast: false,
                                query: ProfileDocument,
                                variables: { userSlug: userPrevData.slug },
                                data: { profile: null! },
                            });

                            // update current user record (here also link with old user cache record is cut)
                            cache.writeQuery<MeQuery>({
                                broadcast: false,
                                query: MeDocument,
                                data: {
                                    me: {
                                        ...userPrevData,
                                        name: updatedProfile.name,
                                        slug: updatedProfile.userSlug,
                                    },
                                },
                            });

                            // remove redundant User and Profile cache records
                            cache.gc();
                        }
                    }
                },
            });
            onModalClose();
        } catch (error) {
            ApolloErrorHandler.process(error).verifyIfAllErrorsAreHandled();
        }
    }, [ onModalClose, withExistingAvatar, userCachedData, updateProfileMutation ]);
}


const useStyles = makeStyles((theme) => ({
    paperWidthSmPlus: {
        // for editor toolbar icons to be in one line at least on desktop
        maxWidth: theme.breakpoints.values.sm + 80,
    },
}));
