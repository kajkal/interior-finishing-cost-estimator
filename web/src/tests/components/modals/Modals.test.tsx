import React from 'react';
import { render, screen } from '@testing-library/react';

import { mockComponent } from '../../__utils__/mockComponent';

import { Modals } from '../../../code/components/modals/Modals';


describe('Modals component', () => {

    beforeAll(() => {
        mockComponent('/code/components/modals/project-update/ProjectUpdateModal');
        mockComponent('/code/components/modals/project-delete/ProjectDeleteModal');
        mockComponent('/code/components/modals/project-file-upload/ProjectFileUploadModal');
        mockComponent('/code/components/modals/product-create/ProductCreateModal');
        mockComponent('/code/components/modals/product-update/ProductUpdateModal');
    });

    it('should render all registered modals', () => {
        render(<Modals />);
        expect(screen.getByTestId('mock-ProjectUpdateModal')).toBeVisible();
        expect(screen.getByTestId('mock-ProjectDeleteModal')).toBeVisible();
        expect(screen.getByTestId('mock-ProjectFileUploadModal')).toBeVisible();
        expect(screen.getByTestId('mock-ProductCreateModal')).toBeVisible();
        expect(screen.getByTestId('mock-ProductUpdateModal')).toBeVisible();
    });

});
