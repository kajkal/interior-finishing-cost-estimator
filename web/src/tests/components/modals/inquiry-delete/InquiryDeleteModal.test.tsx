import React from 'react';
import { useSetRecoilState } from 'recoil/dist';
import userEvent from '@testing-library/user-event';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';

import { ContextMocks, MockContextProvider } from '../../../__utils__/MockContextProvider';

import { Category, DeleteInquiryDocument, DeleteInquiryMutation, DeleteInquiryMutationVariables, Inquiry } from '../../../../graphql/generated-types';
import { inquiryDeleteModalAtom } from '../../../../code/components/modals/inquiry-delete/inquiryDeleteModalAtom';
import { InquiryDeleteModal } from '../../../../code/components/modals/inquiry-delete/InquiryDeleteModal';
import { initApolloCache } from '../../../../code/components/providers/apollo/client/initApolloClient';


describe('InquiryDeleteModal component', () => {

    const sampleInquiry: Inquiry = {
        __typename: 'Inquiry',
        id: '5f09e24646904045d48e5598',
        title: 'Sample inquiry title',
        description: '',
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

    function renderInMockContext(mocks?: ContextMocks) {
        const OpenModalButton = () => {
            const setModalState = useSetRecoilState(inquiryDeleteModalAtom);
            return (
                <button
                    data-testid='open-modal-button'
                    onClick={() => setModalState({
                        open: true,
                        inquiryData: {
                            id: sampleInquiry.id,
                            title: sampleInquiry.title,
                        },
                    })}
                />
            );
        };
        return render(
            <MockContextProvider mocks={mocks}>
                <OpenModalButton />
                <InquiryDeleteModal />
            </MockContextProvider>,
        );
    }

    function initApolloTestCache() {
        const cache = initApolloCache();
        return cache.restore({
            [ cache.identify(sampleInquiry)! ]: sampleInquiry,
            ROOT_QUERY: {
                __typename: 'Query',
                allInquiries: [ { __ref: cache.identify(sampleInquiry) } ],
            },
        });
    }

    class ViewUnderTest {
        static get modal() {
            return screen.queryByLabelText(`t:inquiry.deleteModal.title:{"inquiryTitle":"${sampleInquiry.title}"}`);
        }
        static get cancelButton() {
            return screen.getByRole('button', { name: 't:form.common.cancel' });
        }
        static get deleteButton() {
            return screen.getByRole('button', { name: 't:form.common.delete' });
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

        userEvent.click(ViewUnderTest.cancelButton);

        // verify if modal is again not visible
        await waitForElementToBeRemoved(ViewUnderTest.modal);
    });

    describe('inquiry delete form', () => {

        const mockResponseGenerator = {
            success: () => ({
                request: {
                    query: DeleteInquiryDocument,
                    variables: {
                        inquiryId: sampleInquiry.id,
                    } as DeleteInquiryMutationVariables,
                },
                result: {
                    data: {
                        deleteInquiry: true,
                    } as DeleteInquiryMutation,
                },
            }),
        };

        it('should successfully delete inquiry and close modal', async () => {
            const cache = initApolloTestCache();
            const mockResponse = mockResponseGenerator.success();
            renderInMockContext({ mockResponses: [ mockResponse ], apolloCache: cache });

            const inquiryCacheRecordKey = cache.identify(sampleInquiry)!;

            // verify initial cache records
            expect(cache.extract()).toEqual({
                [ inquiryCacheRecordKey ]: sampleInquiry,
                ROOT_QUERY: {
                    __typename: 'Query',
                    allInquiries: [ { __ref: inquiryCacheRecordKey } ],
                },
            });

            ViewUnderTest.openModal();
            userEvent.click(ViewUnderTest.deleteButton);

            // verify if modal was closed
            await waitForElementToBeRemoved(ViewUnderTest.modal);

            // verify updated cache
            expect(cache.extract()).toEqual({
                // <- removed inquiry record
                ROOT_QUERY: {
                    __typename: 'Query',
                    allInquiries: [], // <- inquiries list without deleted inquiry
                },
                ROOT_MUTATION: expect.any(Object),
            });
        });

    });

});
