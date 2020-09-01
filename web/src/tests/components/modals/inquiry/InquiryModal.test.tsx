/**
 * @jest-environment jsdom-sixteen
 *
 * ^ because of 'Error: Uncaught [TypeError: window.getSelection is not a function]'
 */

import React from 'react';
import { useSetRecoilState } from 'recoil';
import userEvent from '@testing-library/user-event';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';

import { ContextMocks, MockContextProvider } from '../../../__utils__/mocks/MockContextProvider';

import { InquiryModal } from '../../../../code/components/modals/inquiry/InquiryModal';
import { inquiryModalAtom } from '../../../../code/components/modals/inquiry/inquiryModalAtom';
import { Category, Inquiry } from '../../../../graphql/generated-types';


describe('InquiryModal component', () => {

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

    function renderInMockContext(mocks?: ContextMocks) {
        const OpenModalButton = () => {
            const setModalState = useSetRecoilState(inquiryModalAtom);
            return (
                <button
                    data-testid='open-modal-button'
                    onClick={() => setModalState({
                        open: true,
                        inquiryData: sampleInquiry,
                    })}
                />
            );
        };
        return render(
            <MockContextProvider mocks={mocks}>
                <OpenModalButton />
                <InquiryModal isMobile={false} />
            </MockContextProvider>,
        );
    }

    class ViewUnderTest {
        static get modal() {
            return screen.queryByLabelText(new RegExp(sampleInquiry.title));
        }
        static get closeButton() {
            return screen.getByRole('button', { name: 't:form.common.close' });
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

        userEvent.click(ViewUnderTest.closeButton);

        // verify if modal is again not visible
        await waitForElementToBeRemoved(ViewUnderTest.modal);
    });

});
