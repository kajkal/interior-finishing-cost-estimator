import React from 'react';
import { useSetRecoilState } from 'recoil/dist';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';

import { mockUseCurrentUserCachedData } from '../../../__mocks__/code/mockUseCurrentUserCachedData';
import { ContextMocks, MockContextProvider } from '../../../__utils__/mocks/MockContextProvider';
import { generator } from '../../../__utils__/generator';

import { DeleteProjectDocument, DeleteProjectMutation, DeleteProjectMutationVariables } from '../../../../graphql/generated-types';
import { projectDeleteModalAtom } from '../../../../code/components/modals/project-delete/projectDeleteModalAtom';
import { ProjectDeleteModal } from '../../../../code/components/modals/project-delete/ProjectDeleteModal';
import { initApolloCache } from '../../../../code/components/providers/apollo/client/initApolloClient';
import { nav } from '../../../../code/config/nav';


describe('ProjectDeleteModal component', () => {

    const sampleUser = generator.user();
    const sampleProject = generator.project();

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
                            slug: sampleProject.slug,
                            name: sampleProject.name,
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
            return screen.queryByLabelText(`t:project.deleteModal.title:{"projectName":"${sampleProject.name}"}`);
        }
        static get cancelButton() {
            return screen.getByRole('button', { name: 't:form.common.cancel' });
        }
        static get deleteButton() {
            return screen.getByRole('button', { name: 't:form.common.delete' });
        }
        static openModal() {
            userEvent.click(screen.getByTestId('open-modal-button'));
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
            await waitForElementToBeRemoved(ViewUnderTest.modal);

            // verify updated cache
            expect(cache.extract()).toEqual({
                // <- removed project record
                [ userCacheRecordKey ]: {
                    ...sampleUser,
                    // <- removed project details query result
                    projects: [], // <- projects list without deleted project
                },
                ROOT_MUTATION: expect.any(Object),
            });

            // verify if navigation occurred
            expect(screen.getByTestId('location')).toHaveTextContent(nav.createProject());
        });

    });

});
