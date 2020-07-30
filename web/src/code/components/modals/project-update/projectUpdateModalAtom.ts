import { atom } from 'recoil/dist';
import { Project } from '../../../../graphql/generated-types';


export interface ProjectUpdateModalAtomValue {
    open: boolean;
    projectData?: Pick<Project, 'slug' | 'name'>;
}

export const projectUpdateModalAtom = atom<ProjectUpdateModalAtomValue>({
    key: 'projectUpdateModalAtom',
    default: {
        open: false,
    },
});
