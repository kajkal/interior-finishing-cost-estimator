import React from 'react';
import { useRecoilValue } from 'recoil/dist';
import userEvent from '@testing-library/user-event';
import { getByRole, render, screen, waitFor } from '@testing-library/react';

import { ContextMocks, MockContextProvider } from '../../../../__utils__/MockContextProvider';

import { DeleteProjectFileDocument, DeleteProjectFileMutation, DeleteProjectFileMutationVariables, Project, ProjectDetailedDataFragment, ResourceData } from '../../../../../graphql/generated-types';
import { projectFileUploadModalAtom } from '../../../../../code/components/modals/project-file-upload/projectFileUploadModalAtom';
import { InquiryCreateModalAtomValue } from '../../../../../code/components/modals/inquiry-create/inquiryCreateModalAtom';
import { initApolloCache } from '../../../../../code/components/providers/apollo/client/initApolloClient';
import { FileSection } from '../../../../../code/components/pages/project/sections/file/FileSection';


describe('FileSection component', () => {

    let fileUploadState: InquiryCreateModalAtomValue;

    const sampleFile1: ResourceData = {
        __typename: 'ResourceData',
        url: 'sample-url-1',
        name: 'Sample-file-1.name',
        description: 'Sample description',
        createdAt: '2020-08-25T22:25:00.000Z',
    };
    const sampleFile2: ResourceData = {
        __typename: 'ResourceData',
        url: 'sample-url-2',
        name: 'Sample-file-2.name',
        description: null,
        createdAt: '2020-08-25T22:30:00.000Z',
    };
    const sampleProject: ProjectDetailedDataFragment = {
        __typename: 'Project',
        slug: 'sample-project',
        name: 'Sample project',
        location: null,
        files: [ sampleFile1, sampleFile2 ],
        rooms: null,
    };

    function renderInMockContext(mocks?: ContextMocks) {
        const Handle = () => {
            fileUploadState = useRecoilValue(projectFileUploadModalAtom);
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
            return screen.getByRole('button', { name: 't:project.uploadFile' });
        }
        static get fileRows() {
            return screen.getAllByTestId('file');
        }
        static expandSection() {
            const sectionSummary = screen.getByRole('button', { name: 't:project.files' });
            if (!sectionSummary.dataset.expanded) {
                userEvent.click(screen.getByRole('button', { name: 't:project.files' }));
            }
        }
        static getFileRowActions(fileRow: HTMLElement) {
            return {
                deleteButton: () => getByRole(fileRow, 'button', { name: /t:project.removeFile:{"filename":".*"}/ }),
                openLink: () => getByRole(fileRow, 'link', { name: /t:project.openFile:{"filename":".*"}/ }),
            };
        }
    }

    describe('upload file button', () => {

        it('should open ProjectFileUploadModal', () => {
            renderInMockContext();

            ViewUnderTest.expandSection();
            userEvent.click(ViewUnderTest.uploadFileButton);

            // verify if upload project file modal atom state changed
            expect(fileUploadState).toEqual({
                open: true,
                projectData: {
                    slug: sampleProject.slug,
                    name: sampleProject.name,
                },
            });
        });

    });

    describe('file row', () => {

        const mockResponseGenerator = {
            success: () => ({
                request: {
                    query: DeleteProjectFileDocument,
                    variables: {
                        projectSlug: sampleProject.slug,
                        resourceName: sampleFile1.name,
                    } as DeleteProjectFileMutationVariables,
                },
                result: {
                    data: {
                        deleteProjectFile: true,
                    } as DeleteProjectFileMutation,
                },
            }),
        };

        it('should render separate row for each file', () => {
            renderInMockContext();
            ViewUnderTest.expandSection();

            // verify if file rows are  visible when section is expanded
            const firstRow = ViewUnderTest.fileRows[ 0 ];
            expect(firstRow).toBeVisible();
            expect(firstRow).toHaveTextContent(new RegExp(sampleFile1.name));
            expect(firstRow).toHaveTextContent(new RegExp(sampleFile1.description!));
            expect(ViewUnderTest.getFileRowActions(firstRow).openLink()).toHaveAttribute('href', sampleFile1.url);

            const secondRow = ViewUnderTest.fileRows[ 1 ];
            expect(secondRow).toBeVisible();
            expect(secondRow).toHaveTextContent(sampleFile2.name);
            expect(ViewUnderTest.getFileRowActions(secondRow).openLink()).toHaveAttribute('href', sampleFile2.url);
        });

        it('should successfully delete file on delete button click', async () => {
            const cache = initApolloCache();
            cache.restore({ [ cache.identify(sampleProject)! ]: sampleProject });
            renderInMockContext({ mockResponses: [ mockResponseGenerator.success() ], apolloCache: cache });
            ViewUnderTest.expandSection();

            const projectCacheRecordKey = cache.identify(sampleProject)!;

            // verify initial cache records
            expect(cache.extract()).toEqual({
                [ projectCacheRecordKey ]: {
                    ...sampleProject,
                    files: [ sampleFile1, sampleFile2 ],
                },
            });

            const fileRow = ViewUnderTest.fileRows[ 0 ];
            userEvent.click(ViewUnderTest.getFileRowActions(fileRow).deleteButton());

            // verify updated cache
            await waitFor(() => expect(cache.extract()).toEqual({
                [ projectCacheRecordKey ]: {
                    ...sampleProject,
                    files: [ sampleFile2 ], // <- updated files list
                },
                ROOT_MUTATION: expect.any(Object),
            }));
        });

    });

});
