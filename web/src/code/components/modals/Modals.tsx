import React from 'react';

import { useMobileDetect } from '../../utils/hooks/useMobileDetect';
import { ProjectFileUploadModal } from './project-file-upload/ProjectFileUploadModal';
import { ProjectDeleteModal } from './project-delete/ProjectDeleteModal';
import { ProjectUpdateModal } from './project-update/ProjectUpdateModal';
import { ProductCreateModal } from './product-create/ProductCreateModal';
import { ProductUpdateModal } from './product-update/ProductUpdateModal';
import { ProductDeleteModal } from './product-delete/ProductDeleteModal';
import { ProfileUpdateModal } from './profile-update/ProfileUpdateModal';
import { InquiryCreateModal } from './inquiry-create/InquiryCreateModal';
import { InquiryDeleteModal } from './inquiry-delete/InquiryDeleteModal';
import { InquiryUpdateModal } from './inquiry-update/InquiryUpdateModal';
import { InquiryAddQuoteModal } from './inquiry-add-quote/InquiryAddQuoteModal';


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
            <InquiryCreateModal isMobile={isMobile} />
            <InquiryDeleteModal />
            <InquiryUpdateModal isMobile={isMobile} />
            <InquiryAddQuoteModal isMobile={isMobile} />
        </>
    );
}
