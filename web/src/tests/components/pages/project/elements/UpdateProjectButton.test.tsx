import React from 'react';
import { useRecoilValue } from 'recoil/dist';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { ContextMocks, MockContextProvider } from '../../../../__utils__/MockContextProvider';

import { projectUpdateModalAtom } from '../../../../../code/components/modals/project-update/projectUpdateModalAtom';
import { UpdateProjectButton } from '../../../../../code/components/pages/project/elements/UpdateProjectButton';
import { Project } from '../../../../../graphql/generated-types';


describe('UpdateProjectButton component', () => {

    const projectUpdateModalAtomSpy = jest.fn();
    const sampleProject: Partial<Project> = {
        __typename: 'Project',
        slug: 'sample-project',
        name: 'Sample project',
        files: [],
    };

    function renderInMockContext(mocks?: ContextMocks) {
        projectUpdateModalAtomSpy.mockClear();
        const Handle = () => {
            const modalState = useRecoilValue(projectUpdateModalAtom);
            projectUpdateModalAtomSpy(modalState);
            return null;
        };
        return render(
            <MockContextProvider mocks={mocks}>
                <Handle />
                <UpdateProjectButton project={sampleProject as Project} />
            </MockContextProvider>,
        );
    }

    it('should pass project data to ProjectDeleteModal and open it', () => {
        renderInMockContext();

        userEvent.click(screen.getByRole('button', { name: 't:project.updateThisProject' }));

        // verify if upload project file modal atom state changed
        expect(projectUpdateModalAtomSpy).toHaveBeenLastCalledWith({
            open: true,
            projectData: sampleProject,
        });
    });

});
