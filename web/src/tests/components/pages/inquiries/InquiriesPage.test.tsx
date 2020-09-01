/**
 * @jest-environment jsdom-sixteen
 *
 * ^ because of 'Error: Uncaught [TypeError: window.getSelection is not a function]'
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import { useRecoilValue } from 'recoil/dist';
import { render, screen, waitFor } from '@testing-library/react';

import { mockUseCurrentUserCachedData } from '../../../__mocks__/code/mockUseCurrentUserCachedData';
import { ContextMocks, MockContextProvider } from '../../../__utils__/mocks/MockContextProvider';

import { inquiryCreateModalAtom, InquiryCreateModalAtomValue } from '../../../../code/components/modals/inquiry-create/inquiryCreateModalAtom';
import { Category, InquiriesDocument, InquiriesQuery, Inquiry, User } from '../../../../graphql/generated-types';
import { InquiriesPage } from '../../../../code/components/pages/inquiries/InquiriesPage';


describe('InquiriesPage component', () => {

    let createState: InquiryCreateModalAtomValue;

    const sampleUser: Partial<User> = {
        __typename: 'User',
        slug: 'sample-user',
        bookmarkedInquiries: [],
    };

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

    beforeEach(() => {
        mockUseCurrentUserCachedData.mockReturnValue(sampleUser);
    });

    function renderInMockContext(mocks?: ContextMocks) {
        const Handle = () => {
            createState = useRecoilValue(inquiryCreateModalAtom);
            return null;
        };
        return render(
            <MockContextProvider mocks={mocks}>
                <Handle />
                <InquiriesPage />
            </MockContextProvider>,
        );
    }

    const mockResponseGenerator = {
        success: () => ({
            request: {
                query: InquiriesDocument,
            },
            result: {
                data: {
                    allInquiries: [ sampleInquiry ],
                } as InquiriesQuery,
            },
        }),
    };

    class ViewUnderTest {
        static get pageTitle() {
            return screen.getByText('t:inquiry.inquiries');
        }
        static get createInquiryButton() {
            return screen.getByRole('button', { name: 't:inquiry.addInquiry' });
        }
        static getInquiryPanel(name: string) {
            return screen.getByRole('button', { name: new RegExp(name) });
        }
        static waitForPageToLoad() {
            return waitFor(() => expect(ViewUnderTest.pageTitle).toBeVisible());
        }
    }

    it('should render create inquiry button', async () => {
        const mockResponse = mockResponseGenerator.success();
        renderInMockContext({ mockResponses: [ mockResponse ] });
        await ViewUnderTest.waitForPageToLoad();

        expect(ViewUnderTest.createInquiryButton).toBeVisible();
        userEvent.click(ViewUnderTest.createInquiryButton);
        expect(createState).toEqual({ open: true });
    });

    it('should render inquiry list', async () => {
        const mockResponse = mockResponseGenerator.success();
        renderInMockContext({ mockResponses: [ mockResponse ] });
        await ViewUnderTest.waitForPageToLoad();

        expect(ViewUnderTest.getInquiryPanel(sampleInquiry.title)).toBeVisible();
    });

});
