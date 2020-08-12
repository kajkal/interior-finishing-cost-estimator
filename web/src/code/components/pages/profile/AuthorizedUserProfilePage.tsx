import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSetRecoilState } from 'recoil/dist';

import IconButton from '@material-ui/core/IconButton';
import Container from '@material-ui/core/Container';
import EditIcon from '@material-ui/icons/Edit';
import Tooltip from '@material-ui/core/Tooltip';

import { usePageLinearProgressRevealer } from '../../common/progress-indicators/usePageLinearProgressRevealer';
import { profileUpdateModalAtom } from '../../modals/profile-update/profileUpdateModalAtom';
import { useCurrentUserCachedData } from '../../../utils/hooks/useCurrentUserCachedData';
import { mapProfileToProfileUpdateFormData } from '../../../utils/mappers/profileMapper';
import { useProfileQuery } from '../../../../graphql/generated-types';
import { PageActions } from '../../common/page/PageActions';
import { PageHeader } from '../../common/page/PageHeader';
import { PageTitle } from '../../common/page/PageTitle';
import { UserProfile } from './UserProfile';


export function AuthorizedUserProfilePage(): React.ReactElement {
    const { t } = useTranslation();
    const userData = useCurrentUserCachedData();
    const setProfileUpdateModalState = useSetRecoilState(profileUpdateModalAtom);
    const { data: profileData, loading } = useProfileQuery({ variables: { userSlug: userData?.slug! } });
    usePageLinearProgressRevealer(loading);

    const handleProfileUpdateModalOpen = () => {
        profileData && setProfileUpdateModalState({
            open: true,
            withExistingAvatar: Boolean(profileData.profile.avatar),
            profileData: mapProfileToProfileUpdateFormData(profileData.profile, t),
        });
    };

    return (
        <Container maxWidth='md'>

            <PageHeader>
                <PageTitle>
                    {profileData?.profile.name}
                </PageTitle>
                <PageActions>
                    <Tooltip title={profileData ? t('user.updateProfile')! : ''}>
                        <IconButton
                            disabled={!profileData}
                            onClick={handleProfileUpdateModalOpen}
                            aria-label={t('user.updateProfile')}
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                </PageActions>
            </PageHeader>

            {(profileData?.profile) && (
                <UserProfile profile={profileData.profile} />
            )}

        </Container>
    );
}
