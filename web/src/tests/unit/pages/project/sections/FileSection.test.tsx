import React from 'react';
import { gql } from '@apollo/client';
import { GraphQLError } from 'graphql';
import { useRecoilValue } from 'recoil/dist';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { ContextMocks, MockContextProvider } from '../../../../__utils__/MockContextProvider';

import { DeleteProjectFileDocument, DeleteProjectFileMutationVariables, Project, ProjectDetailedDataFragment } from '../../../../../graphql/generated-types';
import { projectFileUploadModalAtom } from '../../../../../code/components/modals/project-file-upload/projectFileUploadModalAtom';
import { UnauthorizedError } from '../../../../../code/components/providers/apollo/errors/UnauthorizedError';
import { initApolloCache } from '../../../../../code/components/providers/apollo/client/initApolloClient';
import { FileSection } from '../../../../../code/components/pages/project/sections/FileSection';


// fixes 'TypeError: document.createRange is not a function' error - related with tooltip component
jest.mock('@material-ui/core/Tooltip', () => ({
    __esModule: true,
    default: ({ children }: React.PropsWithChildren<{}>) => <>{children}</>,
} as const));

describe('FileSection component', () => {

    const projectFileUploadModalAtomSpy = jest.fn();
    const sampleProject: Pick<ProjectDetailedDataFragment, '__typename' | 'slug' | 'name' | 'files'> = {
        __typename: 'Project',
        slug: 'sample-project',
        name: 'Sample project',
        files: [
            {
                __typename: 'ResourceData',
                url: 'sample-url-1',
                name: 'Sample-file-1.name',
                description: 'Sample description',
            },
            {
                __typename: 'ResourceData',
                url: 'sample-url-2',
                name: 'Sample-file-2.name',
                description: null,
            },
        ],
    };

    function renderInMockContext(mocks?: ContextMocks) {
        projectFileUploadModalAtomSpy.mockClear();
        const Handle = () => {
            const modalState = useRecoilValue(projectFileUploadModalAtom);
            projectFileUploadModalAtomSpy(modalState);
            return null;
        };
        return render(
            <MockContextProvider mocks={mocks}>
                <Handle />
                <FileSection project={sampleProject} />
            </MockContextProvider>,
        );
    }

    class ViewUnderTest {
        static get uploadFileButton() {
            return screen.getByRole('button', { name: 't:projectPage.uploadFile' });
        }
        static get fileTiles() {
            return screen.getAllByRole('link');
        }
        static clickDeleteFileButton(index: number) {
            ViewUnderTest.expandSection();
            const fileTile = ViewUnderTest.fileTiles[ index ];
            expect(fileTile).toBeInstanceOf(HTMLAnchorElement);
            expect(fileTile).toBeVisible();
            const deleteButton = fileTile.querySelector('button[aria-label="t:projectPage.removeThisFile"]');
            expect(deleteButton).toBeInstanceOf(HTMLButtonElement);
            userEvent.click(deleteButton!);
        }
        static expandSection() {
            userEvent.click(screen.getByRole('button', { name: 't:projectPage.files' }));
        }
    }

    describe('upload file button', () => {

        it('should render upload file button', () => {
            renderInMockContext();

            // verify if upload button is not visible when section is collapsed
            expect(ViewUnderTest.uploadFileButton).not.toBeVisible();

            ViewUnderTest.expandSection();

            // verify if upload button is visible when section is expanded
            expect(ViewUnderTest.uploadFileButton).toBeVisible();
        });

        it('should pass project data to ProjectFileUploadModal and open it', () => {
            renderInMockContext();

            ViewUnderTest.expandSection();
            userEvent.click(ViewUnderTest.uploadFileButton);

            // verify if upload project file modal atom state changed
            expect(projectFileUploadModalAtomSpy).toHaveBeenLastCalledWith({
                open: true,
                projectData: {
                    slug: sampleProject.slug,
                    name: sampleProject.name,
                },
            });
        });

    });

    describe('file tile', () => {

        const ProjectFilesFragment = gql`
            fragment ProjectFiles on Project {
                files { url, name, description }
            }
        `;

        const mockResponseGenerator = {
            success: () => ({
                request: {
                    query: DeleteProjectFileDocument,
                    variables: {
                        projectSlug: sampleProject.slug,
                        resourceName: sampleProject.files[ 0 ].name,
                    } as DeleteProjectFileMutationVariables,
                },
                result: {
                    data: {
                        deleteProjectFile: true,
                    },
                },
            }),
            resourceOwnerRoleRequired: () => ({
                request: {
                    query: DeleteProjectFileDocument,
                    variables: {
                        projectSlug: sampleProject.slug,
                        resourceName: sampleProject.files[ 0 ].name,
                    } as DeleteProjectFileMutationVariables,
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
                    query: DeleteProjectFileDocument,
                    variables: {
                        projectSlug: sampleProject.slug,
                        resourceName: sampleProject.files[ 0 ].name,
                    } as DeleteProjectFileMutationVariables,
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
                    query: DeleteProjectFileDocument,
                    variables: {
                        projectSlug: sampleProject.slug,
                        resourceName: sampleProject.files[ 0 ].name,
                    } as DeleteProjectFileMutationVariables,
                },
                error: new UnauthorizedError('SESSION_EXPIRED'),
            }),
            networkError: () => ({
                request: {
                    query: DeleteProjectFileDocument,
                    variables: {
                        projectSlug: sampleProject.slug,
                        resourceName: sampleProject.files[ 0 ].name,
                    } as DeleteProjectFileMutationVariables,
                },
                error: new Error('network error'),
            }),
        };

        it('should render separate tile for each file', () => {
            renderInMockContext();

            // verify if file tiles are not visible when section is collapsed
            expect(ViewUnderTest.fileTiles).toHaveLength(2);
            expect(ViewUnderTest.fileTiles[ 0 ]).not.toBeVisible();
            expect(ViewUnderTest.fileTiles[ 1 ]).not.toBeVisible();

            ViewUnderTest.expandSection();

            // verify if file tiles are  visible when section is expanded
            expect(ViewUnderTest.fileTiles[ 0 ]).toBeVisible();
            expect(ViewUnderTest.fileTiles[ 0 ]).toHaveAttribute('href', 'sample-url-1');
            expect(ViewUnderTest.fileTiles[ 0 ]).toHaveTextContent('Sample-file-1.name');
            expect(ViewUnderTest.fileTiles[ 0 ]).toHaveDescription('Sample description');

            expect(ViewUnderTest.fileTiles[ 1 ]).toBeVisible();
            expect(ViewUnderTest.fileTiles[ 1 ]).toHaveAttribute('href', 'sample-url-2');
            expect(ViewUnderTest.fileTiles[ 1 ]).toHaveTextContent('Sample-file-2.name');
            expect(ViewUnderTest.fileTiles[ 1 ]).toHaveDescription('');
        });

        it('should successfully delete file on delete button click', async () => {
            const cache = initApolloCache();
            cache.restore({ [ cache.identify(sampleProject)! ]: sampleProject });
            renderInMockContext({ mockResponses: [ mockResponseGenerator.success() ], apolloCache: cache });
            ViewUnderTest.clickDeleteFileButton(0);

            // verify if cache was updated
            const getProject = () => cache.readFragment<Pick<Project, 'files'>>({
                fragment: ProjectFilesFragment,
                id: cache.identify(sampleProject),
            });
            await waitFor(() => expect(getProject()?.files).toEqual([ sampleProject.files[ 1 ] ]));
        });

        it('should display notification about missing project owner role', async () => {
            renderInMockContext({ mockResponses: [ mockResponseGenerator.resourceOwnerRoleRequired() ] });
            ViewUnderTest.clickDeleteFileButton(0);

            // verify if toast is visible
            const toast = await screen.findByTestId('MockToast');
            expect(toast).toHaveClass('error');
            expect(toast).toHaveTextContent('t:projectPage.resourceOwnerRoleRequiredError');
        });

        it('should display notification about project not found', async () => {
            renderInMockContext({ mockResponses: [ mockResponseGenerator.projectNotFound() ] });
            ViewUnderTest.clickDeleteFileButton(0);

            // verify if toast is visible
            const toast = await screen.findByTestId('MockToast');
            expect(toast).toHaveClass('error');
            expect(toast).toHaveTextContent('t:projectPage.projectNotFoundError');
        });

        it('should display notification about expired session', async () => {
            renderInMockContext({ mockResponses: [ mockResponseGenerator.unauthorized() ] });
            ViewUnderTest.clickDeleteFileButton(0);

            // verify if toast is visible
            const toast = await screen.findByTestId('MockToast');
            expect(toast).toHaveClass('error');
            expect(toast).toHaveTextContent('t:error.sessionExpired');
        });

        it('should display notification about network error', async () => {
            renderInMockContext({ mockResponses: [ mockResponseGenerator.networkError() ] });
            ViewUnderTest.clickDeleteFileButton(0);

            // verify if toast is visible
            const toast = await screen.findByTestId('MockToast');
            expect(toast).toHaveClass('error');
            expect(toast).toHaveTextContent('t:error.networkError');
        });

    });

});
