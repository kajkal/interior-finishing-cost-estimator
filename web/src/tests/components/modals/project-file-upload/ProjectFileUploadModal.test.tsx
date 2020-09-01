import React from 'react';
import { useSetRecoilState } from 'recoil/dist';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';

import { ContextMocks, MockContextProvider } from '../../../__utils__/mocks/MockContextProvider';
import { TextFieldController } from '../../../__utils__/field-controllers/TextFieldController';
import { extendedUserEvent } from '../../../__utils__/extendedUserEvent';
import { generator } from '../../../__utils__/generator';

import { UploadProjectFileDocument, UploadProjectFileMutation, UploadProjectFileMutationVariables } from '../../../../graphql/generated-types';
import { projectFileUploadModalAtom } from '../../../../code/components/modals/project-file-upload/projectFileUploadModalAtom';
import { ProjectFileUploadModal } from '../../../../code/components/modals/project-file-upload/ProjectFileUploadModal';
import { initApolloCache } from '../../../../code/components/providers/apollo/client/initApolloClient';


describe('ProjectFileUploadModal component', () => {

    const sampleFile = generator.file();
    const sampleProject = generator.project({ files: [ sampleFile ] });

    function initApolloTestCache() {
        const cache = initApolloCache();
        return cache.restore({
            [ cache.identify(sampleProject)! ]: sampleProject,
        });
    }

    function renderInMockContext(mocks?: ContextMocks) {
        const OpenModalButton = () => {
            const setModalState = useSetRecoilState(projectFileUploadModalAtom);
            return (
                <button
                    data-testid='open-modal-button'
                    onClick={() => setModalState({
                        open: true,
                        projectData: {
                            name: sampleProject.name,
                            slug: sampleProject.slug,
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
                            __typename: 'ResourceData',
                            url: 'URL_TEST_VALUE',
                            name: 'document.pdf',
                            description: null,
                        },
                    } as UploadProjectFileMutation,
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
            const cache = initApolloTestCache();
            const mockResponse = mockResponseGenerator.success();
            renderInMockContext({ mockResponses: [ mockResponse ], apolloCache: cache });

            const projectCacheRecordKey = cache.identify(sampleProject)!;

            // verify initial cache records
            expect(cache.extract()).toEqual({
                [ projectCacheRecordKey ]: {
                    ...sampleProject,
                    files: [ sampleFile ],
                },
            });

            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if modal was closed
            await waitForElementToBeRemoved(ViewUnderTest.modal);

            // verify updated cache
            const uploadedFile = mockResponse.result.data.uploadProjectFile;
            expect(cache.extract()).toEqual({
                [ projectCacheRecordKey ]: {
                    ...sampleProject,
                    files: [ sampleFile, uploadedFile ], // <- updated file list
                },
                ROOT_MUTATION: expect.any(Object),
            });
        });

    });

});
