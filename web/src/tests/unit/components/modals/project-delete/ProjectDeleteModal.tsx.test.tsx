import React from 'react';
import { GraphQLError } from 'graphql';
import { useSetRecoilState } from 'recoil/dist';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { mockUseCurrentUserCachedData } from '../../../../__mocks__/code/mockUseCurrentUserCachedData';
import { ContextMocks, MockContextProvider } from '../../../../__utils__/MockContextProvider';

import { DeleteProjectDocument, DeleteProjectMutation, DeleteProjectMutationVariables, Project, User } from '../../../../../graphql/generated-types';
import { projectDeleteModalAtom } from '../../../../../code/components/modals/project-delete/projectDeleteModalAtom';
import { ProjectDeleteModal } from '../../../../../code/components/modals/project-delete/ProjectDeleteModal';
import { initApolloCache } from '../../../../../code/components/providers/apollo/client/initApolloClient';
import { nav } from '../../../../../code/config/nav';


describe('ProjectDeleteModal component', () => {

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
            const setModalState = useSetRecoilState(projectDeleteModalAtom);
            return (
                <button
                    data-testid='open-modal-button'
                    onClick={() => setModalState({
                        open: true,
                        projectData: {
                            slug: sampleProject.slug!,
                            name: sampleProject.name!,
                        },
                    })}
                />
            );
        };
        return render(
            <MockContextProvider mocks={mocks}>
                <OpenModalButton />
                <ProjectDeleteModal />
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
            return screen.queryByLabelText(`t:modal.projectDelete.title:{"projectName":"${sampleProject.name}"}`);
        }
        static get cancelButton() {
            return screen.getByRole('button', { name: 't:modal.common.cancel' });
        }
        static get deleteButton() {
            return screen.getByRole('button', { name: 't:modal.projectDelete.delete' });
        }
        static openModal() {
            userEvent.click(screen.getByTestId('open-modal-button'));
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

    describe('project delete form', () => {

        const mockResponseGenerator = {
            success: () => ({
                request: {
                    query: DeleteProjectDocument,
                    variables: {
                        projectSlug: sampleProject.slug,
                    } as DeleteProjectMutationVariables,
                },
                result: {
                    data: {
                        deleteProject: true,
                    } as DeleteProjectMutation,
                },
            }),
            resourceOwnerRoleRequired: () => ({
                request: {
                    query: DeleteProjectDocument,
                    variables: {
                        projectSlug: sampleProject.slug,
                    } as DeleteProjectMutationVariables,
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
                    query: DeleteProjectDocument,
                    variables: {
                        projectSlug: sampleProject.slug,
                    } as DeleteProjectMutationVariables,
                },
                result: {
                    data: null,
                    errors: [
                        { message: 'PROJECT_NOT_FOUND' } as unknown as GraphQLError,
                    ],
                },
            }),
        };


        it('should successfully delete project, close modal and navigate away from project page', async () => {
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

            ViewUnderTest.openModal();
            userEvent.click(ViewUnderTest.deleteButton);

            // verify if modal was closed
            await waitFor(() => expect(ViewUnderTest.modal).toBeNull());

            // verify updated cache
            expect(cache.extract()).toEqual({
                // <- removed project record
                [ userCacheRecordKey ]: {
                    ...sampleUser,
                    // <- removed project details query result
                    projects: [], // <- projects list without deleted project
                },
                'ROOT_MUTATION': expect.any(Object),
            });

            // verify if navigation occurred
            expect(screen.getByTestId('location')).toHaveTextContent(nav.createProject());
        });

        it('should display notification about missing project owner role', async () => {
            const mockResponse = mockResponseGenerator.resourceOwnerRoleRequired();
            renderInMockContext({ mockResponses: [ mockResponse ] });

            ViewUnderTest.openModal();
            userEvent.click(ViewUnderTest.deleteButton);

            // verify if toast is visible
            const toast = await screen.findByTestId('MockToast');
            expect(toast).toHaveClass('error');
            expect(toast).toHaveTextContent('t:projectPage.resourceOwnerRoleRequiredError');
        });

        it('should display notification about project not found', async () => {
            const mockResponse = mockResponseGenerator.projectNotFound();
            renderInMockContext({ mockResponses: [ mockResponse ] });

            ViewUnderTest.openModal();
            userEvent.click(ViewUnderTest.deleteButton);

            // verify if toast is visible
            const toast = await screen.findByTestId('MockToast');
            expect(toast).toHaveClass('error');
            expect(toast).toHaveTextContent('t:projectPage.projectNotFoundError');
        });

    });

});
