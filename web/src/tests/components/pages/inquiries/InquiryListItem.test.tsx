/**
 * @jest-environment jsdom-sixteen
 *
 * ^ because of 'Error: Uncaught [TypeError: window.getSelection is not a function]'
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { InquiryListItem } from '../../../../code/components/pages/inquiries/InquiryListItem';
import { ContextMocks, MockContextProvider } from '../../../__utils__/MockContextProvider';
import { Category, Inquiry } from '../../../../graphql/generated-types';
import { nav } from '../../../../code/config/nav';
import userEvent from '@testing-library/user-event';


describe('InquiryListItem component', () => {

    const sampleInquiry: Inquiry = {
        __typename: 'Inquiry',
        id: '5f09e24646904045d48e5598',
        title: 'Sample inquiry title',
        description: '[{"children":[{"type":"p","children":[{"text":"Sample description"}]}]}]',
        location: {
            __typename: 'Location',
            placeId: 'sample-place-id',
            main: 'City',
            secondary: 'Country',
            lat: 50,
            lng: 20,
        },
        category: Category.DESIGNING,
        author: {
            __typename: 'Author',
            userSlug: 'sample-inquiry-author',
            name: 'Sample Inquiry Author',
            avatar: null,
        },
        quotes: [
            {
                __typename: 'PriceQuote',
                author: {
                    __typename: 'Author',
                    userSlug: 'sample-quote-author',
                    name: 'Sample Quote Author',
                    avatar: null,
                },
                date: '2020-08-17T01:00:00.000Z',
                price: {
                    __typename: 'CurrencyAmount',
                    amount: 50,
                    currency: 'PLN',
                },
            },
        ],
        createdAt: '2020-08-16T21:00:00.000Z',
        updatedAt: null,
    };

    function createWrapper(mocks?: ContextMocks): React.ComponentType {
        return ({ children }) => (
            <MockContextProvider mocks={mocks}>
                {children}
            </MockContextProvider>
        );
    }

    class ViewUnderTest {
        static get openDeleteModalButton() {
            return screen.getByRole('button', { name: 't:form.common.delete' });
        }
        static get openUpdateModalButton() {
            return screen.getByRole('button', { name: 't:form.common.update' });
        }
        static get toggleBookmarkOnButton() {
            return screen.getByRole('button', { name: 't:inquiry.addBookmark' });
        }
        static get toggleBookmarkOffButton() {
            return screen.getByRole('button', { name: 't:inquiry.removeBookmark' });
        }
        static get addQuoteButton() {
            return screen.getByRole('button', { name: 't:inquiry.addQuote' });
        }
        static get removeQuoteButton() {
            return screen.getByRole('button', { name: 't:inquiry.removeQuote' });
        }
    }

    it('should render inquiry summary', () => {
        render(<InquiryListItem
            inquiry={sampleInquiry}
            isBookmarked
            isOwned
            distance={undefined}
            userSlug={undefined}
        />, { wrapper: createWrapper() });

        // verify location chip
        const locationChip = screen.getByRole('button', { name: 'City, Country' });
        expect(locationChip).toBeVisible();
        expect(locationChip).toHaveAttribute('href', 'https://www.google.com/maps/search/?api=1&query=50,20&query_place_id=sample-place-id');

        // verify author chip
        const authorChip = screen.getByRole('button', { name: 'Sample Inquiry Author' });
        expect(authorChip).toBeVisible();
        expect(authorChip).toHaveAttribute('href', nav.user('sample-inquiry-author').profile());

        // verify if inquiry category is visible
        expect(screen.getByText('t:inquiry.categories.designing')).toBeVisible();
    });

    it('should render distance', () => {
        render(<InquiryListItem
            inquiry={sampleInquiry}
            isBookmarked={false}
            isOwned={false}
            distance={0.5}
            userSlug={undefined}
        />, { wrapper: createWrapper() });

        // verify location chip
        const locationChip = screen.getByRole('button', { name: 'City, Country (0.50 km)' });
        expect(locationChip).toBeVisible();
        expect(locationChip).toHaveAttribute('href', 'https://www.google.com/maps/search/?api=1&query=50,20&query_place_id=sample-place-id');
    });

    it('should render inquiry body', () => {
        render(<InquiryListItem
            inquiry={sampleInquiry}
            isBookmarked
            isOwned
            distance={undefined}
            userSlug={undefined}
        />, { wrapper: createWrapper() });

        userEvent.click(screen.getByText('Sample inquiry title'));

        // verify description
        expect(screen.getByText('Sample description')).toBeVisible();

        // verify quote list
        expect(screen.getByRole('button', { name: 'Sample Quote Author' })).toBeVisible();
    });

    it('should render actions reserved for inquiry author', () => {
        render(<InquiryListItem
            inquiry={sampleInquiry}
            isBookmarked={false}
            isOwned={true}
            distance={undefined}
            userSlug={'sample-inquiry-author'}
        />, { wrapper: createWrapper() });

        userEvent.click(screen.getByText('Sample inquiry title'));
        expect(ViewUnderTest.openDeleteModalButton).toBeVisible();
        expect(ViewUnderTest.openUpdateModalButton).toBeVisible();
    });

    it('should render actions reserved for price quote author', () => {
        render(<InquiryListItem
            inquiry={sampleInquiry}
            isBookmarked={false}
            isOwned={false}
            distance={undefined}
            userSlug={'sample-quote-author'}
        />, { wrapper: createWrapper() });

        userEvent.click(screen.getByText('Sample inquiry title'));
        expect(ViewUnderTest.removeQuoteButton).toBeVisible();
    });

    it('should render actions reserved for authenticated user (but not an author of the inquiry)', () => {
        const { rerender } = render(<InquiryListItem
            inquiry={sampleInquiry}
            isBookmarked={false}
            isOwned={false}
            distance={undefined}
            userSlug={'sample-user'}
        />, { wrapper: createWrapper() });

        userEvent.click(screen.getByText('Sample inquiry title'));
        expect(ViewUnderTest.addQuoteButton).toBeVisible();
        expect(ViewUnderTest.toggleBookmarkOnButton).toBeVisible();

        rerender(
            <InquiryListItem
                inquiry={sampleInquiry}
                isBookmarked={true}
                isOwned={false}
                distance={undefined}
                userSlug={'sample-user'}
            />,
        );

        expect(ViewUnderTest.toggleBookmarkOffButton).toBeVisible();
    });

    it('should render no offers message', () => {
        render(<InquiryListItem
            inquiry={{
                ...sampleInquiry,
                quotes: null,
            }}
            isBookmarked={false}
            isOwned={false}
            distance={undefined}
            userSlug={'sample-user'}
        />, { wrapper: createWrapper() });

        userEvent.click(screen.getByText('Sample inquiry title'));
        expect(screen.getByText('t:inquiry.noOffers')).toBeVisible();
    });

});
