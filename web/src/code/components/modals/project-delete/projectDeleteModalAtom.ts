import { atom } from 'recoil/dist';
import { Project } from '../../../../graphql/generated-types';


export interface ProjectDeleteModalAtomValue {
    open: boolean;
    projectData?: Pick<Project, 'slug' | 'name'>;
}

export const projectDeleteModalAtom = atom<ProjectDeleteModalAtomValue>({
    key: 'projectDeleteModalAtom',
    default: {
        open: false,
    },
});
