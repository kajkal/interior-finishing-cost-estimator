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
import { RoomCreateModal } from './room-create/RoomCreateModal';
import { RoomUpdateModal } from './room-update/RoomUpdateModal';
import { RoomDeleteModal } from './room-delete/RoomDeleteModal';
import { ProductModal } from './product/ProductModal';
import { InquiryModal } from './inquiry/InquiryModal';


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
            <RoomCreateModal isMobile={isMobile} />
            <RoomUpdateModal isMobile={isMobile} />
            <RoomDeleteModal />
            <ProductModal isMobile={isMobile} />
            <InquiryModal isMobile={isMobile} />
        </>
    );
}
