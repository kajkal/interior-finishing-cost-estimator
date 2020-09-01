import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';

import { ContextMocks, MockContextProvider } from '../../../../__utils__/mocks/MockContextProvider';

import { Inquiry, PriceQuote, PriceQuoteDataFragment, RemoveQuoteDocument, RemoveQuoteMutation, RemoveQuoteMutationVariables } from '../../../../../graphql/generated-types';
import { RemoveQuoteButton } from '../../../../../code/components/pages/inquiries/actions/RemoveQuoteButton';
import { initApolloCache } from '../../../../../code/components/providers/apollo/client/initApolloClient';


describe('RemoveQuoteButton component', () => {

    const sampleQuote1: PriceQuoteDataFragment = {
        __typename: 'PriceQuote',
        author: { __typename: 'Author', userSlug: 'sample-quote-author', name: 'Sample Quote Author', avatar: null },
        date: '2020-08-17T01:00:00.000Z',
        price: { __typename: 'CurrencyAmount', amount: 50, currency: 'PLN' },
    };

    const sampleQuote2: PriceQuoteDataFragment = {
        __typename: 'PriceQuote',
        author: { __typename: 'Author', userSlug: 'sample-quote-author', name: 'Sample Quote Author', avatar: null },
        date: '2020-08-17T23:00:00.000Z',
        price: { __typename: 'CurrencyAmount', amount: 55, currency: 'PLN' },
    };

    const sampleInquiry: Partial<Inquiry> = {
        __typename: 'Inquiry',
        id: '5f09e24646904045d48e5598',
        quotes: [ sampleQuote1, sampleQuote2 ],
    };

    function renderInMockContext(mocks?: ContextMocks) {
        return render(
            <MockContextProvider mocks={{ ...mocks }}>
                <RemoveQuoteButton inquiryId='5f09e24646904045d48e5598' quoteDate='2020-08-17T23:00:00.000Z' />
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
                    inquiryId: '5f09e24646904045d48e5598',
                    quoteDate: '2020-08-17T23:00:00.000Z',
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
                __typename: 'Inquiry',
                id: '5f09e24646904045d48e5598',
                quotes: [ sampleQuote1, sampleQuote2 ],
            },
        });

        userEvent.click(screen.getByRole('button', { name: 't:inquiry.removeQuote' }));
        await waitForElementToBeRemoved(screen.getByTestId('page-progress'));

        // verify updated cache
        expect(cache.extract()).toEqual({
            [ inquiryCacheRecordKey ]: {
                __typename: 'Inquiry',
                id: '5f09e24646904045d48e5598',
                quotes: [ sampleQuote2 ], // <- updated quotes list
            },
            ROOT_MUTATION: expect.any(Object),
        });
    });

});
