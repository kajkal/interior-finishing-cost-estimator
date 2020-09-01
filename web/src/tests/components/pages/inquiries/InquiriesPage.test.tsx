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
import { generator } from '../../../__utils__/generator';

import { inquiryCreateModalAtom, InquiryCreateModalAtomValue } from '../../../../code/components/modals/inquiry-create/inquiryCreateModalAtom';
import { InquiriesPage } from '../../../../code/components/pages/inquiries/InquiriesPage';
import { InquiriesDocument, InquiriesQuery } from '../../../../graphql/generated-types';


describe('InquiriesPage component', () => {

    let createState: InquiryCreateModalAtomValue;

    const sampleUser = generator.user({ bookmarkedInquiries: [] });
    const sampleInquiry1 = generator.inquiry({
        id: '5f09e24646904045d48e5598',
        quotes: [ generator.quote() ],
        createdAt: '2020-08-16T21:00:00.000Z',
    });
    const sampleInquiry2 = generator.inquiry({
        id: '5f09e24646904045d48e5599',
        quotes: [ generator.quote(), generator.quote() ],
        createdAt: '2020-08-16T20:00:00.000Z',
    });

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
                    allInquiries: [ sampleInquiry1, sampleInquiry2 ],
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

        expect(ViewUnderTest.getInquiryPanel(sampleInquiry1.title)).toBeVisible();
        expect(ViewUnderTest.getInquiryPanel(sampleInquiry2.title)).toBeVisible();
    });

});
