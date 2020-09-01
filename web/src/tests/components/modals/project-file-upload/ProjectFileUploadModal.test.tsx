import React from 'react';
import { gql } from '@apollo/client';
import { useSetRecoilState } from 'recoil/dist';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { ContextMocks, MockContextProvider } from '../../../__utils__/mocks/MockContextProvider';
import { TextFieldController } from '../../../__utils__/field-controllers/TextFieldController';
import { extendedUserEvent } from '../../../__utils__/extendedUserEvent';

import { Project, UploadProjectFileDocument, UploadProjectFileMutationVariables } from '../../../../graphql/generated-types';
import { projectFileUploadModalAtom } from '../../../../code/components/modals/project-file-upload/projectFileUploadModalAtom';
import { ProjectFileUploadModal } from '../../../../code/components/modals/project-file-upload/ProjectFileUploadModal';
import { initApolloCache } from '../../../../code/components/providers/apollo/client/initApolloClient';


describe('ProjectFileUploadModal component', () => {

    const sampleProject: Partial<Project> = {
        __typename: 'Project',
        slug: 'sample-project',
        name: 'Sample project',
        files: [],
    };

    function renderInMockContext(mocks?: ContextMocks) {
        const OpenModalButton = () => {
            const setModalState = useSetRecoilState(projectFileUploadModalAtom);
            return (
                <button
                    data-testid='open-modal-button'
                    onClick={() => setModalState({
                        open: true,
                        projectData: {
                            name: sampleProject.name!,
                            slug: sampleProject.slug!,
                        },
                    })}
                />
            );
        };
        return render(
            <MockContextProvider mocks={mocks}>
                <OpenModalButton />
                <ProjectFileUploadModal isMobile={false} />
            </MockContextProvider>,
        );
    }

    class ViewUnderTest {
        static get modal() {
            return screen.queryByLabelText(`t:project.fileUploadModal.title:{"projectName":"${sampleProject.name}"}`);
        }
        static get fileDropzone() {
            return screen.getByLabelText('t:form.projectFile.label');
        }
        static get descriptionInput() {
            return screen.getByLabelText(/^t:form.projectFileDescription.label/, { selector: 'input' });
        }
        static get cancelButton() {
            return screen.getByRole('button', { name: 't:form.common.cancel' });
        }
        static get submitButton() {
            return screen.getByRole('button', { name: 't:project.fileUploadModal.upload' });
        }
        static openModal() {
            userEvent.click(screen.getByTestId('open-modal-button'));
        }
        static async fillAndSubmitForm(data: UploadProjectFileMutationVariables) {
            ViewUnderTest.openModal();
            await extendedUserEvent.drop(this.fileDropzone, [ data.file ]);
            await extendedUserEvent.type(this.descriptionInput, data.description || '');
            userEvent.click(this.submitButton);
        }
    }

    it('should close modal on cancel button click', async () => {
        renderInMockContext();

        // verify if modal is not visible
        expect(ViewUnderTest.modal).toBeNull();

        ViewUnderTest.openModal();

        // verify if modal is visible
        expect(ViewUnderTest.modal).toBeVisible();

        userEvent.click(ViewUnderTest.cancelButton);

        // verify if modal is again not visible
        await waitFor(() => expect(ViewUnderTest.modal).toBeNull());
    });

    describe('project file upload form', () => {

        const ProjectFilesFragment = gql`
            fragment ProjectFiles on Project {
                files { url, name, description }
            }
        `;

        const mockResponseGenerator = {
            success: () => ({
                request: {
                    query: UploadProjectFileDocument,
                    variables: {
                        projectSlug: sampleProject.slug,
                        file: new File([], 'document.pdf', { type: 'application/pdf' }),
                        description: null,
                    } as UploadProjectFileMutationVariables,
                },
                result: {
                    data: {
                        uploadProjectFile: {
                            url: 'URL_TEST_VALUE',
                            name: 'document.pdf',
                            description: null,
                            __typename: 'ResourceData',
                        },
                    },
                },
            }),
        };

        describe('validation', () => {

            it('should validate file input value', async () => {
                renderInMockContext();
                ViewUnderTest.openModal();
                expect(ViewUnderTest.fileDropzone).toHaveFocus();
                userEvent.tab(); // blur dropzone
                await waitFor(() => expect(ViewUnderTest.fileDropzone).toBeInvalid());
                expect(ViewUnderTest.fileDropzone).toHaveDescription('t:form.projectFile.validation.required');
            });

            it('should validate description input value', async () => {
                renderInMockContext();
                ViewUnderTest.openModal();
                await TextFieldController.from(ViewUnderTest.descriptionInput)
                    .type('').expectNoError()
                    .type('a'.repeat(1)).expectNoError()
                    .paste('a'.repeat(255)).expectNoError()
                    .paste('a'.repeat(256)).expectError('t:form.projectFileDescription.validation.tooLong');
            });

        });

        it('should successfully upload file and close modal', async () => {
            const cache = initApolloCache();
            cache.restore({ [ cache.identify(sampleProject)! ]: sampleProject });
            const mockResponse = mockResponseGenerator.success();
            renderInMockContext({ mockResponses: [ mockResponse ], apolloCache: cache });
            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if modal was closed
            await waitFor(() => expect(ViewUnderTest.modal).toBeNull());

            // verify if project cache was updated with new file
            const project = cache.readFragment<Pick<Project, 'files'>>({
                fragment: ProjectFilesFragment,
                id: cache.identify(sampleProject),
            });
            expect(project).not.toBeNull();
            expect(project!.files).toEqual([
                mockResponse.result.data.uploadProjectFile,
            ]);
        });

    });

});
