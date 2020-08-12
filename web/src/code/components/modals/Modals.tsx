import React from 'react';

import { useMobileDetect } from '../../utils/hooks/useMobileDetect';
import { ProjectFileUploadModal } from './project-file-upload/ProjectFileUploadModal';
import { ProjectDeleteModal } from './project-delete/ProjectDeleteModal';
import { ProjectUpdateModal } from './project-update/ProjectUpdateModal';
import { ProductCreateModal } from './product-create/ProductCreateModal';
import { ProductUpdateModal } from './product-update/ProductUpdateModal';
import { ProductDeleteModal } from './product-delete/ProductDeleteModal';
import { ProfileUpdateModal } from './profile-update/ProfileUpdateModal';


export function Modals(): React.ReactElement {
    const isMobile = useMobileDetect();
    return (
        <>
            <ProjectFileUploadModal isMobile={isMobile} />
            <ProjectDeleteModal />
            <ProjectUpdateModal isMobile={isMobile} />
            <ProductCreateModal isMobile={isMobile} />
            <ProductUpdateModal isMobile={isMobile} />
            <ProductDeleteModal />
            <ProfileUpdateModal isMobile={isMobile} />
        </>
    );
}
