import { atom } from 'recoil/dist';
import { Project } from '../../../../graphql/generated-types';


export interface RoomCreateModalAtomValue {
    open: boolean;
    projectData?: Pick<Project, 'slug'>;
}

export const roomCreateModalAtom = atom<RoomCreateModalAtomValue>({
    key: 'roomCreateModalAtom',
    default: {
        open: false,
    },
});
