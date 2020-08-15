/**
 * @jest-environment jsdom-sixteen
 *
 * ^ because of 'Error: Uncaught [TypeError: window.getSelection is not a function]'
 */

import React from 'react';
import { useSetRecoilState } from 'recoil/dist';
import userEvent from '@testing-library/user-event';
import { fireEvent, render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';

import { LocationFieldController } from '../../../__utils__/field-controllers/LocationFieldController';
import { CategoryFieldController } from '../../../__utils__/field-controllers/CategoryFieldController';
import { EditorFieldController } from '../../../__utils__/field-controllers/EditorFieldController';
import { TextFieldController } from '../../../__utils__/field-controllers/TextFieldController';
import { ContextMocks, MockContextProvider } from '../../../__utils__/MockContextProvider';
import { flushPromises } from '../../../__utils__/extendedUserEvent';

import { Category, CreateInquiryDocument, CreateInquiryMutation, CreateInquiryMutationVariables } from '../../../../graphql/generated-types';
import { inquiryCreateModalAtom } from '../../../../code/components/modals/inquiry-create/inquiryCreateModalAtom';
import { InquiryCreateModal } from '../../../../code/components/modals/inquiry-create/InquiryCreateModal';
import { initApolloCache } from '../../../../code/components/providers/apollo/client/initApolloClient';


describe('InquiryCreateModal component', () => {

    function renderInMockContext(mocks?: ContextMocks) {
        const OpenModalButton = () => {
            const setModalState = useSetRecoilState(inquiryCreateModalAtom);
            return (
                <button
                    data-testid='open-modal-button'
                    onClick={() => setModalState({ open: true })}
                />
            );
        };
        return render(
            <MockContextProvider mocks={mocks}>
                <OpenModalButton />
                <InquiryCreateModal isMobile={false} />
            </MockContextProvider>,
        );
    }

    function initApolloTestCache() {
        const cache = initApolloCache();
        return cache.restore({
            ROOT_QUERY: {
                __typename: 'Query',
                allInquiries: [],
            },
        });
    }

    class ViewUnderTest {
        static get modal() {
            return screen.queryByLabelText(`t:inquiry.createModal.title`);
        }
        static get inquiryTitleInput() {
            return screen.getByLabelText('t:form.inquiryTitle.label', { selector: 'input' });
        }
        static get inquiryDescriptionInput() {
            return screen.getByTestId('slate-editor');
        }
        static get inquiryLocationSelect() {
            return screen.getByLabelText('t:form.location.label', { selector: 'input' });
        }
        static get inquiryCategorySelect() {
            return screen.getByLabelText('t:form.inquiryCategory.label', { selector: 'input' });
        }
        static get cancelButton() {
            return screen.getByRole('button', { name: 't:form.common.cancel' });
        }
        static get createButton() {
            return screen.getByRole('button', { name: 't:form.common.create' });
        }
        static async openModal() {
            userEvent.click(screen.getByTestId('open-modal-button'));
            await waitFor(() => expect(ViewUnderTest.modal).toBeInTheDocument());
        }
        static async fillAndSubmitForm(data: CreateInquiryMutationVariables) {
            await ViewUnderTest.openModal();

            await TextFieldController.from(ViewUnderTest.inquiryTitleInput)
                .type(data.title);
            await EditorFieldController.from(ViewUnderTest.inquiryDescriptionInput)
                .typeInEditor('Sample description');
            await LocationFieldController.from(ViewUnderTest.inquiryLocationSelect)
                .selectLocation(data.location);
            await CategoryFieldController.from(ViewUnderTest.inquiryCategorySelect)
                .selectCategory(data.category);

            userEvent.click(this.createButton);
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

    describe('inquiry create form', () => {

        const mockResponseGenerator = {
            success: () => ({
                request: {
                    query: CreateInquiryDocument,
                    variables: {
                        title: 'Sample title',
                        description: '[{"children":[{"type":"p","children":[{"text":"Sample description"}]}]}]',
                        location: {
                            placeId: 'ChIJ0RhONcBEFkcRv4pHdrW2a7Q',
                            main: 'Kraków',
                            secondary: 'Poland',
                            lat: 50,
                            lng: 20,
                        },
                        category: Category.DESIGNING,
                    } as CreateInquiryMutationVariables,
                },
                result: {
                    data: {
                        createInquiry: {
                            __typename: 'Inquiry',
                            id: 'sampleInquiryId',
                            title: 'Sample title',
                            description: '[{"children":[{"type":"p","children":[{"text":"Sample description"}]}]}]',
                            location: {
                                placeId: 'ChIJ0RhONcBEFkcRv4pHdrW2a7Q',
                                main: 'Kraków',
                                secondary: 'Poland',
                                lat: 50,
                                lng: 20,
                            },
                            category: Category.DESIGNING,
                        },
                    } as CreateInquiryMutation,
                },
            }),
        };

        describe('validation', () => {

            it('should validate inquiryTitle input value', async () => {
                renderInMockContext();
                await ViewUnderTest.openModal();
                expect(ViewUnderTest.inquiryTitleInput).toHaveFocus();

                await TextFieldController.from(ViewUnderTest.inquiryTitleInput)
                    .type('').expectError('t:form.inquiryTitle.validation.required')
                    .type('a'.repeat(2)).expectError('t:form.inquiryTitle.validation.tooShort')
                    .type('a'.repeat(3)).expectNoError()
                    .paste('a'.repeat(256)).expectError('t:form.inquiryTitle.validation.tooLong')
                    .paste('a'.repeat(255)).expectNoError()
                    .type('valid inquiry name').expectNoError();
            });

            it('should validate inquiryDescription input value', async () => {
                renderInMockContext();
                await ViewUnderTest.openModal();

                await EditorFieldController.from(ViewUnderTest.inquiryDescriptionInput)
                    .typeInEditor('').expectError('t:form.inquiryDescription.validation.required')
                    .typeInEditor('Valid description').expectNoError();
            });

            it('should validate inquiryLocation input value', async () => {
                renderInMockContext();
                await ViewUnderTest.openModal();
                fireEvent.focus(ViewUnderTest.inquiryLocationSelect);
                fireEvent.blur(ViewUnderTest.inquiryLocationSelect);
                await flushPromises();

                await LocationFieldController.from(ViewUnderTest.inquiryLocationSelect)
                    .expectError('t:form.location.validation.required')
                    .selectLocation({
                        placeId: 'ChIJ0RhONcBEFkcRv4pHdrW2a7Q',
                        main: 'Kraków',
                        secondary: 'Poland',
                        lat: 50,
                        lng: 20,
                    }).expectNoError();
            });

            it('should validate inquiryCategory input value', async () => {
                renderInMockContext();
                await ViewUnderTest.openModal();
                fireEvent.focus(ViewUnderTest.inquiryCategorySelect);
                fireEvent.blur(ViewUnderTest.inquiryCategorySelect);
                await flushPromises();

                await CategoryFieldController.from(ViewUnderTest.inquiryCategorySelect)
                    .expectError('t:form.inquiryCategory.validation.required')
                    .selectCategory(Category.DESIGNING).expectNoError();
            });

        });

        it('should successfully create inquiry and close modal', async () => {
            const cache = initApolloTestCache();
            const mockResponse = mockResponseGenerator.success();
            renderInMockContext({ mockResponses: [ mockResponse ], apolloCache: cache });

            // verify initial cache records
            expect(cache.extract()).toEqual({
                ROOT_QUERY: {
                    __typename: 'Query',
                    allInquiries: [],
                },
            });

            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if modal was closed
            await waitForElementToBeRemoved(ViewUnderTest.modal);

            // verify updated cache
            const createdInquiry = mockResponse.result.data.createInquiry;
            const createdInquiryCacheRecordKey = cache.identify(createdInquiry)!;
            expect(cache.extract()).toEqual({
                [ createdInquiryCacheRecordKey ]: createdInquiry, // <- created inquiry  record
                ROOT_QUERY: {
                    __typename: 'Query',
                    allInquiries: [ { __ref: createdInquiryCacheRecordKey } ], // <- inquires list with new inquiry ref
                },
                ROOT_MUTATION: expect.any(Object),
            });
        });

    });

});
