import { atom } from 'recoil/dist';
import { SlateDocument } from '@udecode/slate-plugins';
import { LocationOption } from '../../common/form-fields/location/LocationField';


export interface ProfileUpdateFormData {
    name: string;
    avatar: File | null;
    description: SlateDocument;
    location: LocationOption | null;
}

export interface ProfileUpdateModalAtomValue {
    open: boolean;
    withExistingAvatar?: boolean;
    profileData?: ProfileUpdateFormData;
}

export const profileUpdateModalAtom = atom<ProfileUpdateModalAtomValue>({
    key: 'profileUpdateModalAtom',
    default: {
        open: false,
    },
});
