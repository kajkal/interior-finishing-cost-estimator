import { atom } from 'recoil/dist';
import { ProjectDetailedDataFragment, RoomDataFragment } from '../../../../graphql/generated-types';


export interface RoomDeleteFormData {
    projectSlug: string;
    roomId: string;
}

export interface RoomDeleteModalAtomValue {
    open: boolean;
    roomData?: Pick<RoomDataFragment, 'id' | 'name'>;
    projectData?: Pick<ProjectDetailedDataFragment, 'slug'>;
}

/**
 * @see RoomDeleteModal - controlled modal
 */
export const roomDeleteModalAtom = atom<RoomDeleteModalAtomValue>({
    key: 'roomDeleteModalAtom',
    default: {
        open: false,
    },
});
