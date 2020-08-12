import { TFunction } from 'i18next';

import { ProfileUpdateFormData } from '../../components/modals/profile-update/profileUpdateModalAtom';
import { emptyEditorValue } from '../../components/common/form-fields/ritch-text-editor/options';
import { UserProfileDataFragment } from '../../../graphql/generated-types';
import { mapLocationToLocationOption } from './locationMapper';


export function mapProfileToProfileUpdateFormData(profile: UserProfileDataFragment, t: TFunction): ProfileUpdateFormData {
    return {
        avatar: profile.avatar ? new File([], t('user.currentAvatar'), { type: 'image/png' }) : null,
        description: profile.description ? JSON.parse(profile.description) : emptyEditorValue,
        location: mapLocationToLocationOption(profile.location || null),
    };
}
