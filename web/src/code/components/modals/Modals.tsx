import React from 'react';

import { useMobileDetect } from '../../utils/hooks/useMobileDetect';
import { ProjectFileUploadModal } from './project-file-upload/ProjectFileUploadModal';
import { ProjectDeleteConfirmationModal } from './project-delete-confirmation/ProjectDeleteConfirmationModal';
import { ProjectUpdateModal } from './project-update/ProjectUpdateModal';


export function Modals(): React.ReactElement {
    const isMobile = useMobileDetect();
    return (
        <>
            <ProjectFileUploadModal isMobile={isMobile} />
            <ProjectDeleteConfirmationModal />
            <ProjectUpdateModal isMobile={isMobile} />
        </>
    );
}
