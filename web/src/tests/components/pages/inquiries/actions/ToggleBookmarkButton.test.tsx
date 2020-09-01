import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';

import { ContextMocks, MockContextProvider } from '../../../../__utils__/mocks/MockContextProvider';
import { generator } from '../../../../__utils__/generator';

import { BookmarkInquiryDocument, BookmarkInquiryMutation, BookmarkInquiryMutationVariables } from '../../../../../graphql/generated-types';
import { ToggleBookmarkButton } from '../../../../../code/components/pages/inquiries/actions/ToggleBookmarkButton';
import { initApolloCache } from '../../../../../code/components/providers/apollo/client/initApolloClient';


describe('ToggleBookmarkButton component', () => {

    const sampleUser = generator.user({
        bookmarkedInquiries: [ 'inquiry-id-1', 'inquiry-id-2' ],
    });

    function renderInMockContext(mocks?: ContextMocks) {
        return render(
            <MockContextProvider mocks={{ ...mocks }}>
                <ToggleBookmarkButton inquiryId='inquiry-id-1' userSlug={sampleUser.slug} isBookmarked />
            </MockContextProvider>,
        );
    }

    function initApolloTestCache() {
        const cache = initApolloCache();
        return cache.restore({
            [ cache.identify(sampleUser)! ]: sampleUser,
        });
    }

    const mockResponseGenerator = {
        success: () => ({
            request: {
                query: BookmarkInquiryDocument,
                variables: {
                    inquiryId: 'inquiry-id-1',
                    bookmark: false,
                } as BookmarkInquiryMutationVariables,
            },
            result: {
                data: {
                    bookmarkInquiry: [ 'inquiry-id-2' ],
                } as BookmarkInquiryMutation,
            },
        }),
    };

    it('should toggle bookmark on click', async () => {
        const cache = initApolloTestCache();
        const mockResponse = mockResponseGenerator.success();
        renderInMockContext({ mockResponses: [ mockResponse ], apolloCache: cache });

        const userCacheRecordKey = cache.identify(sampleUser)!;

        // verify initial cache records
        expect(cache.extract()).toEqual({
            [ userCacheRecordKey ]: {
                ...sampleUser,
                bookmarkedInquiries: [ 'inquiry-id-1', 'inquiry-id-2' ],
            },
        });

        userEvent.click(screen.getByRole('button', { name: 't:inquiry.removeBookmark' }));
        await waitForElementToBeRemoved(screen.getByTestId('page-progress'));

        // verify updated cache
        expect(cache.extract()).toEqual({
            [ userCacheRecordKey ]: {
                ...sampleUser,
                bookmarkedInquiries: [ 'inquiry-id-2' ], // <- updated bookmarks list
            },
            ROOT_MUTATION: expect.any(Object),
        });
    });

});
