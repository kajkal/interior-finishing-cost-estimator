import React from 'react';
import { useRecoilValue } from 'recoil/dist';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ContextMocks, MockContextProvider } from '../../../../__utils__/MockContextProvider';
import { generator } from '../../../../__utils__/generator';

import { projectDeleteModalAtom } from '../../../../../code/components/modals/project-delete/projectDeleteModalAtom';
import { DeleteProjectButton } from '../../../../../code/components/pages/project/elements/DeleteProjectButton';
import { mapProjectDataToCompleteProjectData } from '../../../../../code/utils/mappers/projectMapper';


describe('DeleteProjectButton component', () => {

    const projectDeleteModalAtomSpy = jest.fn();
    const sampleProject = mapProjectDataToCompleteProjectData(generator.project(), { products: [], inquiries: [] });

    function renderInMockContext(mocks?: ContextMocks) {
        projectDeleteModalAtomSpy.mockClear();
        const Handle = () => {
            const modalState = useRecoilValue(projectDeleteModalAtom);
            projectDeleteModalAtomSpy(modalState);
            return null;
        };
        return render(
            <MockContextProvider mocks={mocks}>
                <Handle />
                <DeleteProjectButton project={sampleProject} />
            </MockContextProvider>,
        );
    }

    it('should pass project data to ProjectDeleteModal and open it', () => {
        renderInMockContext();

        userEvent.click(screen.getByRole('button', { name: 't:project.deleteThisProject' }));

        // verify if upload project file modal atom state changed
        expect(projectDeleteModalAtomSpy).toHaveBeenLastCalledWith({
            open: true,
            projectData: sampleProject,
        });
    });

});
