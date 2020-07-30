import { atom } from 'recoil/dist';
import { Project } from '../../../../graphql/generated-types';


export interface ProjectDeleteConfirmationModalAtomValue {
    open: boolean;
    onConfirm?: () => void;
    projectData?: Pick<Project, 'name'>;
}

export const projectDeleteConfirmationModalAtom = atom<ProjectDeleteConfirmationModalAtomValue>({
    key: 'projectDeleteConfirmationModalAtom',
    default: {
        open: false,
    },
});
