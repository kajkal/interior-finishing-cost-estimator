import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSetRecoilState } from 'recoil/dist';

import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import Tooltip from '@material-ui/core/Tooltip';

import { projectUpdateModalAtom } from '../../../modals/project-update/projectUpdateModalAtom';
import { CompleteProjectData } from '../../../../utils/mappers/projectMapper';


export interface UpdateProjectButtonProps {
    project: CompleteProjectData;
}

/**
 * @see ProjectUpdateModal
 */
export function UpdateProjectButton({ project }: UpdateProjectButtonProps): React.ReactElement {
    const { t } = useTranslation();
    const setModalState = useSetRecoilState(projectUpdateModalAtom);
    const handleClick = () => {
        setModalState({
            open: true,
            projectData: project,
        });
    };

    return (
        <Tooltip title={t('project.updateThisProject')!}>
            <IconButton onClick={handleClick} aria-label={t('project.updateThisProject')}>
                <EditIcon />
            </IconButton>
        </Tooltip>
    );
}
