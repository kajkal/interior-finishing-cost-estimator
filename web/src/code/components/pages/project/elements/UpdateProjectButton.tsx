import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSetRecoilState } from 'recoil/dist';

import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import Tooltip from '@material-ui/core/Tooltip';

import { ProjectDetailedDataFragment } from '../../../../../graphql/generated-types';
import { projectUpdateModalAtom } from '../../../modals/project-update/projectUpdateModalAtom';


export interface UpdateProjectButtonProps {
    project: ProjectDetailedDataFragment;
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
        <Tooltip title={t('projectPage.updateThisProject')!}>
            <IconButton onClick={handleClick} aria-label={t('projectPage.updateThisProject')}>
                <EditIcon />
            </IconButton>
        </Tooltip>
    );
}
