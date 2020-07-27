import React from 'react';
import { ProjectFileUploadModal } from './project-file-upload/ProjectFileUploadModal';
import { useMobileDetect } from '../../utils/hooks/useMobileDetect';


export function Modals(): React.ReactElement {
    const isMobile = useMobileDetect();
    return (
        <>
            <ProjectFileUploadModal isMobile={isMobile} />
        </>
    );
}
