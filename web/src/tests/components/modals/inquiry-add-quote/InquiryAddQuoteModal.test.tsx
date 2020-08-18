/**
 * @jest-environment jsdom-sixteen
 *
 * ^ because of 'Error: Uncaught [TypeError: window.getSelection is not a function]'
 */

import React from 'react';
import { useSetRecoilState } from 'recoil/dist';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { CurrencyAmountFieldController } from '../../../__utils__/field-controllers/CurrencyAmountFieldController';
import { ContextMocks, MockContextProvider } from '../../../__utils__/MockContextProvider';

import { AddQuoteDocument, AddQuoteMutation, AddQuoteMutationVariables, Category, Inquiry } from '../../../../graphql/generated-types';
import { inquiryAddQuoteModalAtom } from '../../../../code/components/modals/inquiry-add-quote/inquiryAddQuoteModalAtom';
import { InquiryAddQuoteModal } from '../../../../code/components/modals/inquiry-add-quote/InquiryAddQuoteModal';
import { initApolloCache } from '../../../../code/components/providers/apollo/client/initApolloClient';


describe('InquiryAddQuoteModal component', () => {

    const sampleInquiry: Inquiry = {
        __typename: 'Inquiry',
        id: '5f09e24646904045d48e5598',
        title: 'Sample inquiry title',
        description: '[{"children":[{"type":"p","children":[{"text":"Sample description"}]}]}]',
        location: {
            __typename: 'Location',
            placeId: '',
            main: '',
            secondary: '',
            lat: -1,
            lng: -1,
        },
        category: Category.DESIGNING,
        author: {
            __typename: 'Author',
            userSlug: '',
            name: '',
            avatar: null,
        },
        quotes: null,
        createdAt: '',
        updatedAt: null,
    };

    function initApolloTestCache() {
        const cache = initApolloCache();
        return cache.restore({
            [ cache.identify(sampleInquiry)! ]: sampleInquiry,
        });
    }

    function renderInMockContext(mocks?: ContextMocks) {
        const OpenModalButton = () => {
            const setModalState = useSetRecoilState(inquiryAddQuoteModalAtom);
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
                <InquiryAddQuoteModal isMobile={false} />
            </MockContextProvider>,
        );
    }

    class ViewUnderTest {
        static get modal() {
            return screen.queryByLabelText(`t:inquiry.addQuoteModal.title`);
        }
        static get priceQuoteInput() {
            return screen.getByLabelText('t:form.inquiryPriceQuote.label', { selector: 'input' });
        }
        static get cancelButton() {
            return screen.getByRole('button', { name: 't:form.common.cancel' });
        }
        static get submitButton() {
            return screen.getByRole('button', { name: 't:form.common.create' });
        }
        static async openModal() {
            userEvent.click(screen.getByTestId('open-modal-button'));
            await waitFor(() => expect(ViewUnderTest.modal).toBeInTheDocument());
        }
        static async fillAndSubmitForm(data: AddQuoteMutationVariables) {
            await ViewUnderTest.openModal();

            await CurrencyAmountFieldController.from(ViewUnderTest.priceQuoteInput)
                .selectCurrency(data.price.currency)
                .pasteAmount(data.price.amount.toString());

            userEvent.click(this.submitButton);
        }
    }

    it('should close modal on cancel button click', async () => {
        renderInMockContext();

        // verify if modal is not visible
        expect(ViewUnderTest.modal).toBeNull();

        await ViewUnderTest.openModal();

        // verify if modal is visible
        expect(ViewUnderTest.modal).toBeVisible();

        userEvent.click(ViewUnderTest.cancelButton);

        // verify if modal is again not visible
        await waitForElementToBeRemoved(ViewUnderTest.modal);
    });

    describe('add quote form', () => {

        const mockResponseGenerator = {
            success: () => ({
                request: {
                    query: AddQuoteDocument,
                    variables: {
                        inquiryId: sampleInquiry.id,
                        price: {
                            currency: 'PLN',
                            amount: 450,
                        },
                    } as AddQuoteMutationVariables,
                },
                result: {
                    data: {
                        addQuote: [
                            {
                                __typename: 'PriceQuote',
                                author: {
                                    __typename: 'Author',
                                    userSlug: 'sample-quote-author',
                                    name: 'Sample Quote Author',
                                    avatar: null,
                                },
                                date: '2020-08-18T01:00:00.000Z',
                                price: {
                                    __typename: 'CurrencyAmount',
                                    currency: 'PLN',
                                    amount: 450,
                                },
                            },
                        ],
                    } as AddQuoteMutation,
                },
            }),
        };

        describe('validation', () => {

            it('should validate productPrice input value', async () => {
                renderInMockContext();
                await ViewUnderTest.openModal();

                await CurrencyAmountFieldController.from(ViewUnderTest.priceQuoteInput)
                    .pasteAmount('').expectError('t:form.inquiryPriceQuote.validation.required')
                    .pasteAmount('10000000').expectError('t:form.inquiryPriceQuote.validation.tooHigh')
                    .pasteAmount('100000').expectNoError();
            });

        });

        it('should successfully add quote and close modal', async () => {
            const cache = initApolloTestCache();
            const mockResponse = mockResponseGenerator.success();
            renderInMockContext({ mockResponses: [ mockResponse ], apolloCache: cache });

            const inquiryCacheRecordKey = cache.identify(sampleInquiry)!;

            // verify initial cache records
            expect(cache.extract()).toEqual({
                [ inquiryCacheRecordKey ]: sampleInquiry,
            });

            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if modal was closed
            await waitForElementToBeRemoved(ViewUnderTest.modal);

            // verify updated cache
            const updatedQuotes = mockResponse.result.data.addQuote;
            expect(cache.extract()).toEqual({
                // <- updated inquiry record
                [ inquiryCacheRecordKey ]: {
                    ...sampleInquiry,
                    quotes: updatedQuotes,
                },
                ROOT_MUTATION: expect.any(Object),
            });
        });

    });

});
