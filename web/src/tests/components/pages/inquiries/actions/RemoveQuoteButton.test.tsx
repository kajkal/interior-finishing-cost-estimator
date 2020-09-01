import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';

import { ContextMocks, MockContextProvider } from '../../../../__utils__/mocks/MockContextProvider';
import { generator } from '../../../../__utils__/generator';

import { RemoveQuoteDocument, RemoveQuoteMutation, RemoveQuoteMutationVariables } from '../../../../../graphql/generated-types';
import { RemoveQuoteButton } from '../../../../../code/components/pages/inquiries/actions/RemoveQuoteButton';
import { initApolloCache } from '../../../../../code/components/providers/apollo/client/initApolloClient';


describe('RemoveQuoteButton component', () => {

    const sampleQuote1 = generator.quote({ date: '2020-08-17T01:00:00.000Z' });
    const sampleQuote2 = generator.quote({ date: '2020-08-17T23:00:00.000Z' });
    const sampleInquiry = generator.inquiry({
        id: '5f09e24646904045d48e5598',
        quotes: [ sampleQuote1, sampleQuote2 ],
    });

    function renderInMockContext(mocks?: ContextMocks) {
        return render(
            <MockContextProvider mocks={{ ...mocks }}>
                <RemoveQuoteButton inquiryId={sampleInquiry.id} quoteDate={sampleQuote1.date} />
            </MockContextProvider>,
        );
    }

    function initApolloTestCache() {
        const cache = initApolloCache();
        return cache.restore({
            [ cache.identify(sampleInquiry)! ]: sampleInquiry,
        });
    }

    const mockResponseGenerator = {
        success: () => ({
            request: {
                query: RemoveQuoteDocument,
                variables: {
                    inquiryId: sampleInquiry.id,
                    quoteDate: sampleQuote1.date,
                } as RemoveQuoteMutationVariables,
            },
            result: {
                data: {
                    removeQuote: [ sampleQuote2 ],
                } as RemoveQuoteMutation,
            },
        }),
    };

    it('should delete quote on click', async () => {
        const cache = initApolloTestCache();
        const mockResponse = mockResponseGenerator.success();
        renderInMockContext({ mockResponses: [ mockResponse ], apolloCache: cache });

        const inquiryCacheRecordKey = cache.identify(sampleInquiry)!;

        // verify initial cache records
        expect(cache.extract()).toEqual({
            [ inquiryCacheRecordKey ]: {
                ...sampleInquiry,
                quotes: [ sampleQuote1, sampleQuote2 ],
            },
        });

        userEvent.click(screen.getByRole('button', { name: 't:inquiry.removeQuote' }));
        await waitForElementToBeRemoved(screen.getByTestId('page-progress'));

        // verify updated cache
        expect(cache.extract()).toEqual({
            [ inquiryCacheRecordKey ]: {
                ...sampleInquiry,
                quotes: [ sampleQuote2 ], // <- updated quotes list
            },
            ROOT_MUTATION: expect.any(Object),
        });
    });

});
