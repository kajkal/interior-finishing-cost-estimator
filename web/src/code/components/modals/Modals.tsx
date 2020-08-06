import React from 'react';

import { useMobileDetect } from '../../utils/hooks/useMobileDetect';
import { ProjectFileUploadModal } from './project-file-upload/ProjectFileUploadModal';
import { ProjectDeleteModal } from './project-delete/ProjectDeleteModal';
import { ProjectUpdateModal } from './project-update/ProjectUpdateModal';
import { ProductCreateModal } from './product-create/ProductCreateModal';


export function Modals(): React.ReactElement {
    const isMobile = useMobileDetect();
    return (
        <>
            <ProjectFileUploadModal isMobile={isMobile} />
            <ProjectDeleteModal />
            <ProjectUpdateModal isMobile={isMobile} />
            <ProductCreateModal isMobile={isMobile} />
        </>
    );
}
