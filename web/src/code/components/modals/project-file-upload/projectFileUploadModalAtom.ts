import { atom } from 'recoil/dist';
import { Project } from '../../../../graphql/generated-types';


export interface ProjectFileUploadModalState {
    open: boolean;
    projectData?: Pick<Project, 'slug' | 'name'>;
}

export const projectFileUploadModalAtom = atom<ProjectFileUploadModalState>({
    key: 'projectFileUploadModalAtom',
    default: {
        open: false,
        projectData: undefined,
    },
});
