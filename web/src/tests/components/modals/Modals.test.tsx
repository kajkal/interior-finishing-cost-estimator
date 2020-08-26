import React from 'react';
import { render, screen } from '@testing-library/react';

import { mockComponent } from '../../__utils__/mockComponent';

import { Modals } from '../../../code/components/modals/Modals';


describe('Modals component', () => {

    beforeAll(() => {
        mockComponent('/code/components/modals/profile-update/ProfileUpdateModal');

        mockComponent('/code/components/modals/project-update/ProjectUpdateModal');
        mockComponent('/code/components/modals/project-delete/ProjectDeleteModal');
        mockComponent('/code/components/modals/project-file-upload/ProjectFileUploadModal');

        mockComponent('/code/components/modals/product-create/ProductCreateModal');
        mockComponent('/code/components/modals/product-update/ProductUpdateModal');
        mockComponent('/code/components/modals/product-delete/ProductDeleteModal');

        mockComponent('/code/components/modals/inquiry-create/InquiryCreateModal');
        mockComponent('/code/components/modals/inquiry-update/InquiryUpdateModal');
        mockComponent('/code/components/modals/inquiry-delete/InquiryDeleteModal');
        mockComponent('/code/components/modals/inquiry-add-quote/InquiryAddQuoteModal');

        mockComponent('/code/components/modals/room-create/RoomCreateModal');
        mockComponent('/code/components/modals/room-update/RoomUpdateModal');
        mockComponent('/code/components/modals/room-delete/RoomDeleteModal');
    });

    it('should render all registered modals', () => {
        render(<Modals />);
        expect(screen.getByTestId('mock-ProfileUpdateModal')).toBeVisible();

        expect(screen.getByTestId('mock-ProjectUpdateModal')).toBeVisible();
        expect(screen.getByTestId('mock-ProjectDeleteModal')).toBeVisible();
        expect(screen.getByTestId('mock-ProjectFileUploadModal')).toBeVisible();

        expect(screen.getByTestId('mock-ProductCreateModal')).toBeVisible();
        expect(screen.getByTestId('mock-ProductUpdateModal')).toBeVisible();
        expect(screen.getByTestId('mock-ProductDeleteModal')).toBeVisible();

        expect(screen.getByTestId('mock-InquiryCreateModal')).toBeVisible();
        expect(screen.getByTestId('mock-InquiryUpdateModal')).toBeVisible();
        expect(screen.getByTestId('mock-InquiryDeleteModal')).toBeVisible();
        expect(screen.getByTestId('mock-InquiryAddQuoteModal')).toBeVisible();

        expect(screen.getByTestId('mock-RoomCreateModal')).toBeVisible();
        expect(screen.getByTestId('mock-RoomUpdateModal')).toBeVisible();
        expect(screen.getByTestId('mock-RoomDeleteModal')).toBeVisible();
    });

});
