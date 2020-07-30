import React from 'react';
import { GraphQLError } from 'graphql';
import { useSetRecoilState } from 'recoil/dist';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { mockUseCurrentUserCachedData } from '../../../../__mocks__/code/mockUseCurrentUserCachedData';
import { ContextMocks, MockContextProvider } from '../../../../__utils__/MockContextProvider';
import { extendedUserEvent } from '../../../../__utils__/extendedUserEvent';
import { InputValidator } from '../../../../__utils__/InputValidator';

import { MutationUpdateProjectArgs, Project, UpdateProjectDocument, UpdateProjectMutation, UpdateProjectMutationVariables, User } from '../../../../../graphql/generated-types';
import { projectUpdateModalAtom } from '../../../../../code/components/modals/project-update/projectUpdateModalAtom';
import { ProjectUpdateModal } from '../../../../../code/components/modals/project-update/ProjectUpdateModal';
import { initApolloCache } from '../../../../../code/components/providers/apollo/client/initApolloClient';


describe('ProjectUpdateModal component', () => {

    const sampleProject: Partial<Project> = {
        __typename: 'Project',
        slug: 'sample-project',
        name: 'Sample project',
        files: [],
    };

    const sampleUser: Partial<User> = {
        __typename: 'User',
        slug: 'sample-user',
    };

    beforeEach(() => {
        mockUseCurrentUserCachedData.mockReturnValue(sampleUser);
    });

    function renderInMockContext(mocks?: ContextMocks) {
        const OpenModalButton = () => {
            const setModalState = useSetRecoilState(projectUpdateModalAtom);
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
                <ProjectUpdateModal isMobile={false} />
            </MockContextProvider>,
        );
    }

    function initApolloTestCache() {
        const cache = initApolloCache();
        return cache.restore({
            [ cache.identify(sampleProject)! ]: sampleProject,
            [ cache.identify(sampleUser)! ]: {
                ...sampleUser,
                [ `project({"slug":"${sampleProject.slug}"})` ]: { __ref: cache.identify(sampleProject) }, // ProjectDetailsQuery result
                projects: [
                    { __ref: cache.identify(sampleProject) },
                ],
            },
        });
    }

    class ViewUnderTest {
        static get modal() {
            return screen.queryByLabelText(`t:modal.projectUpdate.title:{"projectName":"${sampleProject.name}"}`);
        }
        static get projectNameInput() {
            return screen.getByLabelText('t:form.projectName.label', { selector: 'input' });
        }
        static get cancelButton() {
            return screen.getByRole('button', { name: 't:modal.common.cancel' });
        }
        static get resetButton() {
            return screen.getByRole('button', { name: 't:modal.common.reset' });
        }
        static get submitButton() {
            return screen.getByRole('button', { name: 't:modal.projectUpdate.update' });
        }
        static openModal() {
            userEvent.click(screen.getByTestId('open-modal-button'));
        }
        static async fillAndSubmitForm(data: MutationUpdateProjectArgs) {
            ViewUnderTest.openModal();
            await extendedUserEvent.type(this.projectNameInput, data.name || '');
            userEvent.click(this.submitButton);
        }
    }

    it('should close modal on cancel button click', async () => {
        renderInMockContext();

        // verify is modal is not visible
        expect(ViewUnderTest.modal).toBeNull();

        screen.debug();

        ViewUnderTest.openModal();
        screen.debug();

        // verify is modal is visible
        expect(ViewUnderTest.modal).toBeVisible();

        userEvent.click(ViewUnderTest.cancelButton);

        // verify is modal is again not visible
        await waitFor(() => expect(ViewUnderTest.modal).toBeNull());
    });

    describe('project update form', () => {

        const mockResponseGenerator = {
            success: () => ({
                request: {
                    query: UpdateProjectDocument,
                    variables: {
                        projectSlug: sampleProject.slug,
                        name: 'Updated project name',
                    } as UpdateProjectMutationVariables,
                },
                result: {
                    data: {
                        updateProject: {
                            __typename: 'Project',
                            id: '-',
                            slug: 'updated-project-name',
                            name: 'Updated project name',
                            files: [],
                        },
                    } as UpdateProjectMutation,
                },
            }),
            resourceOwnerRoleRequired: () => ({
                request: {
                    query: UpdateProjectDocument,
                    variables: {
                        projectSlug: sampleProject.slug,
                        name: 'Updated project name',
                    } as UpdateProjectMutationVariables,
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
                    query: UpdateProjectDocument,
                    variables: {
                        projectSlug: sampleProject.slug,
                        name: 'Updated project name',
                    } as UpdateProjectMutationVariables,
                },
                result: {
                    data: null,
                    errors: [
                        { message: 'PROJECT_NOT_FOUND' } as unknown as GraphQLError,
                    ],
                },
            }),
        };

        describe('validation', () => {

            it('should validate projectName input value', async () => {
                renderInMockContext();
                ViewUnderTest.openModal();
                await InputValidator.basedOn(ViewUnderTest.projectNameInput)
                    .expectError('', 't:form.projectName.validation.required')
                    .expectError('aa', 't:form.projectName.validation.tooShort')
                    .expectError('a'.repeat(51), 't:form.projectName.validation.tooLong')
                    .expectNoError('a'.repeat(50), 't:modal.projectUpdate.urlWillChange')
                    .expectNoError('valid project name', 't:modal.projectUpdate.urlWillChange')
                    .expectNoError(sampleProject.name!);
            });

        });

        it('should successfully update project and close modal (with changed slug)', async () => {
            const cache = initApolloTestCache();
            const mockResponse = mockResponseGenerator.success();
            renderInMockContext({ mockResponses: [ mockResponse ], apolloCache: cache });

            const userCacheRecordKey = cache.identify(sampleUser)!;
            const projectCacheRecordKey = cache.identify(sampleProject)!;
            const projectDetailsCacheRecordKey = `project({"slug":"${sampleProject.slug}"})`;

            // verify initial cache records
            expect(cache.extract()).toEqual({
                [ projectCacheRecordKey ]: expect.any(Object),
                [ userCacheRecordKey ]: {
                    ...sampleUser,
                    [ projectDetailsCacheRecordKey ]: { __ref: projectCacheRecordKey },
                    projects: [ { __ref: projectCacheRecordKey } ],
                },
            });

            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if modal was closed
            await waitFor(() => expect(ViewUnderTest.modal).toBeNull());

            // verify updated cache
            const updatedProject = mockResponse.result.data.updateProject;
            const updatedProjectCacheRecordKey = cache.identify(updatedProject)!;
            const updatedProjectDetailsCacheRecordKey = `project({"slug":"${updatedProject.slug}"})`;
            expect(cache.extract()).toEqual({
                // <- old project record should be removed
                [ updatedProjectCacheRecordKey ]: updatedProject, // <- updated project record
                [ userCacheRecordKey ]: {
                    ...sampleUser,
                    // <- removed old project details query result
                    [ updatedProjectDetailsCacheRecordKey ]: { __ref: updatedProjectCacheRecordKey }, // <- updated project details query result
                    projects: [ { __ref: updatedProjectCacheRecordKey } ], // <- projects list with updated ref
                },
                'ROOT_MUTATION': expect.any(Object),
                'ROOT_QUERY': expect.any(Object),
            });
        });

        it('should display notification about missing project owner role', async () => {
            const mockResponse = mockResponseGenerator.resourceOwnerRoleRequired();
            renderInMockContext({ mockResponses: [ mockResponse ] });
            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if toast is visible
            const toast = await screen.findByTestId('MockToast');
            expect(toast).toHaveClass('error');
            expect(toast).toHaveTextContent('t:projectPage.resourceOwnerRoleRequiredError');
        });

        it('should display notification about project not found', async () => {
            const mockResponse = mockResponseGenerator.projectNotFound();
            renderInMockContext({ mockResponses: [ mockResponse ] });
            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if toast is visible
            const toast = await screen.findByTestId('MockToast');
            expect(toast).toHaveClass('error');
            expect(toast).toHaveTextContent('t:projectPage.projectNotFoundError');
        });

    });

});
