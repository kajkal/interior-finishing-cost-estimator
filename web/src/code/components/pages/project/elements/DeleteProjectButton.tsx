import React from 'react';
import { useSetRecoilState } from 'recoil/dist';
import { useTranslation } from 'react-i18next';

import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Tooltip from '@material-ui/core/Tooltip';

import { ProjectDetailedDataFragment } from '../../../../../graphql/generated-types';
import { projectDeleteModalAtom } from '../../../modals/project-delete/projectDeleteModalAtom';


export interface DeleteProjectButtonProps {
    project: ProjectDetailedDataFragment;
}

/**
 * @see ProjectDeleteModal
 */
export function DeleteProjectButton({ project }: DeleteProjectButtonProps): React.ReactElement {
    const { t } = useTranslation();
    const setModalState = useSetRecoilState(projectDeleteModalAtom);
    const handleClick = () => {
        setModalState({
            open: true,
            projectData: project,
        });
    };

    return (
        <Tooltip title={t('projectPage.deleteThisProject')!} arrow>
            <IconButton onClick={handleClick} aria-label={t('projectPage.deleteThisProject')}>
                <DeleteIcon />
            </IconButton>
        </Tooltip>
    );
}
