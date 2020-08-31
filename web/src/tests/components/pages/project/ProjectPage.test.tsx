import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';

import { mockUseCurrentUserCachedData } from '../../../__mocks__/code/mockUseCurrentUserCachedData';
import { ContextMocks, MockContextProvider } from '../../../__utils__/MockContextProvider';
import { generator } from '../../../__utils__/generator';

import { ProjectDetailsDocument, ProjectDetailsQuery, ProjectDetailsQueryVariables, User } from '../../../../graphql/generated-types';
import { ProjectPage } from '../../../../code/components/pages/project/ProjectPage';
import { navMap } from '../../../../code/config/nav';


jest.mock('use-resize-observer', () => ({
    __esModule: true,
    default: () => ({}),
}));

describe('ProjectPage component', () => {

    const sampleProduct1 = generator.product();
    const sampleProduct2 = generator.product();
    const sampleProduct3 = generator.product();
    const sampleInquiry1 = generator.inquiry();
    const sampleInquiry2 = generator.inquiry();
    const sampleRoom = generator.room({
        products: [
            { __typename: 'LinkedProduct', productId: sampleProduct1.id, amount: 1 },
            { __typename: 'LinkedProduct', productId: sampleProduct2.id, amount: 1.5 },
            { __typename: 'LinkedProduct', productId: 'no-longer-existing-product', amount: 1 },
        ],
        inquiries: [
            { __typename: 'LinkedInquiry', inquiryId: sampleInquiry1.id },
            { __typename: 'LinkedInquiry', inquiryId: 'no-longer-existing-inquiry' },
        ],
    });
    const sampleProject = generator.project({ rooms: [ sampleRoom ] });
    const sampleUser = generator.user({
        products: [ sampleProduct1, sampleProduct2, sampleProduct3 ],
        inquiries: [ sampleInquiry1, sampleInquiry2 ],
    });

    beforeEach(() => {
        mockUseCurrentUserCachedData.mockReturnValue(sampleUser);
    });

    function renderInMockContext(mocks?: ContextMocks) {
        return render(
            <MockContextProvider mocks={mocks}>
                <Routes>
                    <Route path={navMap.projects + '/:projectSlug'} element={<ProjectPage />} />
                </Routes>
            </MockContextProvider>,
        );
    }

    const mockResponseGenerator = {
        success: () => ({
            request: {
                query: ProjectDetailsDocument,
                variables: {
                    slug: sampleProject.slug,
                } as ProjectDetailsQueryVariables,
            },
            result: {
                data: {
                    me: {
                        __typename: 'User',
                        slug: sampleUser.slug,
                        project: sampleProject,
                    },
                } as ProjectDetailsQuery,
            },
        }),
        notFound: () => ({
            request: {
                query: ProjectDetailsDocument,
                variables: {
                    slug: 'project-not-found',
                } as ProjectDetailsQueryVariables,
            },
            result: {
                data: {
                    me: {
                        __typename: 'User',
                        slug: sampleUser.slug,
                        project: null,
                    },
                } as ProjectDetailsQuery,
            },
        }),
    };

    it('should render project not found page when project not exists', async () => {
        const mockResponse = mockResponseGenerator.notFound();
        renderInMockContext({
            initialEntries: [ '/projects/project-not-found' ],
            mockResponses: [ mockResponse ],
        });

        // wait for server response
        await waitForElementToBeRemoved(screen.getByTestId('page-progress'));

        // verify if 'not found' message is visible
        expect(screen.getByText('404')).toBeVisible();
        expect(screen.getByText('t:notFoundPage.pageNotFound')).toBeVisible();
    });

    it('should render project page', async () => {
        const mockResponse = mockResponseGenerator.success();
        renderInMockContext({
            initialEntries: [ `/projects/${sampleProject.slug}` ],
            mockResponses: [ mockResponse ],
        });

        // wait for server response
        await waitForElementToBeRemoved(screen.getByTestId('page-progress'));

        // verify is project actions are visible (delete, edit)
        expect(screen.getByRole('button', { name: 't:project.deleteThisProject' })).toBeVisible();
        expect(screen.getByRole('button', { name: 't:project.updateThisProject' })).toBeVisible();

        // verify if key sections are visible (files, rooms, summary)
        expect(screen.getByRole('button', { name: 't:project.files' })).toBeVisible();
        expect(screen.getByRole('button', { name: 't:project.rooms' })).toBeVisible();
        expect(screen.getByRole('button', { name: 't:project.summary' })).toBeVisible();
    });

});
