import React from 'react';
import { render, screen } from '@testing-library/react';

import { mockComponent } from '../../../__utils__/mockComponent';

import { Modals } from '../../../../code/components/modals/Modals';


describe('Modals component', () => {

    beforeAll(() => {
        mockComponent('../../code/components/modals/project-file-upload/ProjectFileUploadModal');
    });

    it('should render all registered modals', () => {
        render(<Modals />);
        expect(screen.getByTestId('mock-ProjectFileUploadModal')).toBeVisible();
    });

});
