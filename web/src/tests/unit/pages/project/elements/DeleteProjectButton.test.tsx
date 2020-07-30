import React from 'react';
import { GraphQLError } from 'graphql';
import { useRecoilValue } from 'recoil/dist';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { mockUseCurrentUserCachedData } from '../../../../__mocks__/code/mockUseCurrentUserCachedData';
import { ContextMocks, MockContextProvider } from '../../../../__utils__/MockContextProvider';

import { DeleteProjectDocument, DeleteProjectMutation, DeleteProjectMutationVariables, Project, User } from '../../../../../graphql/generated-types';
import { projectDeleteConfirmationModalAtom } from '../../../../../code/components/modals/project-delete-confirmation/projectDeleteConfirmationModalAtom';
import { DeleteProjectButton } from '../../../../../code/components/pages/project/elements/DeleteProjectButton';
import { initApolloCache } from '../../../../../code/components/providers/apollo/client/initApolloClient';
import { nav } from '../../../../../code/config/nav';


describe('DeleteProjectButton component', () => {

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
        const ProjectDeleteAutoConfirmation = () => {
            const modalState = useRecoilValue(projectDeleteConfirmationModalAtom);
            React.useEffect(() => {
                modalState.open && modalState.onConfirm!();
            }, [ modalState ]);
            return null;
        };
        return render(
            <MockContextProvider mocks={mocks}>
                <ProjectDeleteAutoConfirmation />
                <DeleteProjectButton projectName={sampleProject.name!} projectSlug={sampleProject.slug!} />
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
        static get deleteButton() {
            return screen.getByRole('button', { name: 't:projectPage.deleteThisProject' });
        }
    }

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

    it('should successfully delete project and navigate away from project page', async () => {
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

        userEvent.click(ViewUnderTest.deleteButton);

        // verify if navigation occurred
        await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(nav.createProject()));

        // verify updated cache
        expect(cache.extract()).toEqual({
            // <- project record should be removed
            [ userCacheRecordKey ]: {
                ...sampleUser,
                // <- project details query result should be removed
                projects: [], // <- projects list should be without deleted project
            },
            'ROOT_MUTATION': expect.any(Object),
        });
    });

    it('should display notification about missing project owner role', async () => {
        const mockResponse = mockResponseGenerator.resourceOwnerRoleRequired();
        renderInMockContext({ mockResponses: [ mockResponse ] });
        userEvent.click(ViewUnderTest.deleteButton);

        // verify if toast is visible
        const toast = await screen.findByTestId('MockToast');
        expect(toast).toHaveClass('error');
        expect(toast).toHaveTextContent('t:projectPage.resourceOwnerRoleRequiredError');
    });

    it('should display notification about project not found', async () => {
        const mockResponse = mockResponseGenerator.projectNotFound();
        renderInMockContext({ mockResponses: [ mockResponse ] });
        userEvent.click(ViewUnderTest.deleteButton);

        // verify if toast is visible
        const toast = await screen.findByTestId('MockToast');
        expect(toast).toHaveClass('error');
        expect(toast).toHaveTextContent('t:projectPage.projectNotFoundError');
    });

});
