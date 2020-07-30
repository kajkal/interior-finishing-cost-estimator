import React from 'react';
import { render, screen } from '@testing-library/react';

import { mockComponent } from '../../../__utils__/mockComponent';

import { Modals } from '../../../../code/components/modals/Modals';


describe('Modals component', () => {

    beforeAll(() => {
        mockComponent('../../code/components/modals/project-file-upload/ProjectFileUploadModal');
        mockComponent('../../code/components/modals/project-delete-confirmation/ProjectDeleteConfirmationModal');
    });

    it('should render all registered modals', () => {
        render(<Modals />);
        expect(screen.getByTestId('mock-ProjectFileUploadModal')).toBeVisible();
        expect(screen.getByTestId('mock-ProjectDeleteConfirmationModal')).toBeVisible();
    });

});
