import React from 'react';
import { useSetRecoilState } from 'recoil/dist';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { ContextMocks, MockContextProvider } from '../../../../__utils__/MockContextProvider';

import { projectDeleteConfirmationModalAtom } from '../../../../../code/components/modals/project-delete-confirmation/projectDeleteConfirmationModalAtom';
import { ProjectDeleteConfirmationModal } from '../../../../../code/components/modals/project-delete-confirmation/ProjectDeleteConfirmationModal';
import { Project } from '../../../../../graphql/generated-types';


describe('ProjectDeleteConfirmationModal component', () => {

    const sampleProject: Partial<Project> = {
        __typename: 'Project',
        name: 'Sample project',
    };

    function renderInMockContext(mocks?: ContextMocks & { onConfirm: () => void }) {
        const OpenModalButton = () => {
            const setModalState = useSetRecoilState(projectDeleteConfirmationModalAtom);
            return (
                <button
                    data-testid='open-modal-button'
                    onClick={() => setModalState({
                        open: true,
                        onConfirm: mocks?.onConfirm,
                        projectData: {
                            name: sampleProject.name!,
                        },
                    })}
                />
            );
        };
        return render(
            <MockContextProvider mocks={mocks}>
                <OpenModalButton />
                <ProjectDeleteConfirmationModal />
            </MockContextProvider>,
        );
    }

    class ViewUnderTest {
        static get modal() {
            return screen.queryByLabelText(`t:modal.projectDeleteConfirmation.title:{"projectName":"${sampleProject.name}"}`);
        }
        static get cancelButton() {
            return screen.getByRole('button', { name: 't:modal.common.cancel' });
        }
        static get deleteButton() {
            return screen.getByRole('button', { name: 't:modal.projectDeleteConfirmation.delete' });
        }
        static openModal() {
            userEvent.click(screen.getByTestId('open-modal-button'));
        }
    }

    it('should close modal on cancel button click', async () => {
        const mockOnConfirm = jest.fn();
        renderInMockContext({ onConfirm: mockOnConfirm });

        // verify is modal is not visible
        expect(ViewUnderTest.modal).toBeNull();

        ViewUnderTest.openModal();

        // verify is modal is visible
        expect(ViewUnderTest.modal).toBeVisible();

        userEvent.click(ViewUnderTest.cancelButton);

        // verify is modal is again not visible
        await waitFor(() => expect(ViewUnderTest.modal).toBeNull());

        // verify if {onConfirm} was not called
        expect(mockOnConfirm).toHaveBeenCalledTimes(0);
    });

    it('should call {onConfirm} on delete button click', async () => {
        const mockOnConfirm = jest.fn();
        renderInMockContext({ onConfirm: mockOnConfirm });

        ViewUnderTest.openModal();
        userEvent.click(ViewUnderTest.deleteButton);

        // verify if modal was closed
        await waitFor(() => expect(ViewUnderTest.modal).toBeNull());

        // verify if {onConfirm} was called
        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

});
