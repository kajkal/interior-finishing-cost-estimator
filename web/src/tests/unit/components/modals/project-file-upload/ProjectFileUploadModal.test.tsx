import React from 'react';
import { gql } from '@apollo/client';
import { GraphQLError } from 'graphql';
import { useSetRecoilState } from 'recoil/dist';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { ContextMocks, MockContextProvider } from '../../../../__utils__/MockContextProvider';
import { extendedUserEvent } from '../../../../__utils__/extendedUserEvent';
import { InputValidator } from '../../../../__utils__/InputValidator';

import { Project, UploadProjectFileDocument, UploadProjectFileMutationVariables } from '../../../../../graphql/generated-types';
import { projectFileUploadModalAtom } from '../../../../../code/components/modals/project-file-upload/projectFileUploadModalAtom';
import { ProjectFileUploadModal } from '../../../../../code/components/modals/project-file-upload/ProjectFileUploadModal';
import { UnauthorizedError } from '../../../../../code/components/providers/apollo/errors/UnauthorizedError';
import { initApolloCache } from '../../../../../code/components/providers/apollo/client/initApolloClient';


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
            return screen.queryByLabelText(`t:modal.projectFileUpload.title:{"projectName":"${sampleProject.name}"}`);
        }
        static get fileDropzone() {
            return screen.getByLabelText('t:form.projectFile.label');
        }
        static get descriptionInput() {
            return screen.getByLabelText(/^t:form.projectFileDescription.label/, { selector: 'input' });
        }
        static get cancelButton() {
            return screen.getByRole('button', { name: 't:modal.common.cancel' });
        }
        static get submitButton() {
            return screen.getByRole('button', { name: 't:modal.projectFileUpload.upload' });
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

        // verify is modal is not visible
        expect(ViewUnderTest.modal).toBeNull();

        ViewUnderTest.openModal();

        // verify is modal is visible
        expect(ViewUnderTest.modal).toBeVisible();

        userEvent.click(ViewUnderTest.cancelButton);

        // verify is modal is again not visible
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
            resourceOwnerRoleRequired: () => ({
                request: {
                    query: UploadProjectFileDocument,
                    variables: {
                        projectSlug: sampleProject.slug,
                        file: new File([], 'document.pdf', { type: 'application/pdf' }),
                        description: 'Not mine project',
                    } as UploadProjectFileMutationVariables,
                },
                result: {
                    data: null,
                    errors: [
                        { message: 'RESOURCE_OWNER_ROLE_REQUIRED' } as unknown as GraphQLError,
                    ],
                },
            }),
            projectNotFound: () => ({
                request: {
                    query: UploadProjectFileDocument,
                    variables: {
                        projectSlug: sampleProject.slug,
                        file: new File([], 'document.pdf', { type: 'application/pdf' }),
                        description: 'Not existing project',
                    } as UploadProjectFileMutationVariables,
                },
                result: {
                    data: null,
                    errors: [
                        { message: 'PROJECT_NOT_FOUND' } as unknown as GraphQLError,
                    ],
                },
            }),
            unauthorized: () => ({
                request: {
                    query: UploadProjectFileDocument,
                    variables: {
                        projectSlug: sampleProject.slug,
                        file: new File([], 'document.pdf', { type: 'application/pdf' }),
                        description: 'Session expired',
                    } as UploadProjectFileMutationVariables,
                },
                error: new UnauthorizedError('SESSION_EXPIRED'),
            }),
            networkError: () => ({
                request: {
                    query: UploadProjectFileDocument,
                    variables: {
                        projectSlug: sampleProject.slug,
                        file: new File([], 'document.pdf', { type: 'application/pdf' }),
                        description: 'Network error',
                    } as UploadProjectFileMutationVariables,
                },
                error: new Error('network error'),
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
                await InputValidator.basedOn(ViewUnderTest.descriptionInput)
                    .expectError('a'.repeat(256), 't:form.projectFileDescription.validation.tooLong')
                    .expectNoError('')
                    .expectNoError('validEmail@domain.com');
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

        it('should display notification about missing project owner role', async () => {
            const mockResponse = mockResponseGenerator.resourceOwnerRoleRequired();
            renderInMockContext({ mockResponses: [ mockResponse ] });
            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if toast is visible
            const toast = await screen.findByTestId('MockToast');
            expect(toast).toHaveClass('error');
            expect(toast).toHaveTextContent('t:modal.projectFileUpload.resourceOwnerRoleRequiredError');
        });

        it('should display notification about project not found', async () => {
            const mockResponse = mockResponseGenerator.projectNotFound();
            renderInMockContext({ mockResponses: [ mockResponse ] });
            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if toast is visible
            const toast = await screen.findByTestId('MockToast');
            expect(toast).toHaveClass('error');
            expect(toast).toHaveTextContent('t:modal.projectFileUpload.projectNotFoundError');
        });

        it('should display notification about expired session', async () => {
            const mockResponse = mockResponseGenerator.unauthorized();
            renderInMockContext({ mockResponses: [ mockResponse ] });
            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if toast is visible
            const toast = await screen.findByTestId('MockToast');
            expect(toast).toHaveClass('error');
            expect(toast).toHaveTextContent('t:error.sessionExpired');
        });

        it('should display notification about network error', async () => {
            const mockResponse = mockResponseGenerator.networkError();
            renderInMockContext({ mockResponses: [ mockResponse ] });
            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if toast is visible
            const toast = await screen.findByTestId('MockToast');
            expect(toast).toHaveClass('error');
            expect(toast).toHaveTextContent('t:error.networkError');
        });

    });

});
