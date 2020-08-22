/**
 * @jest-environment jsdom-sixteen
 *
 * ^ because of 'Error: Uncaught [TypeError: window.getSelection is not a function]'
 */

import React from 'react';
import { useSetRecoilState } from 'recoil/dist';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';

import { CategoryFieldController } from '../../../__utils__/field-controllers/CategoryFieldController';
import { LocationFieldController } from '../../../__utils__/field-controllers/LocationFieldController';
import { EditorFieldController } from '../../../__utils__/field-controllers/EditorFieldController';
import { TextFieldController } from '../../../__utils__/field-controllers/TextFieldController';
import { ContextMocks, MockContextProvider } from '../../../__utils__/MockContextProvider';

import { Category, CreateInquiryMutationVariables, Inquiry, UpdateInquiryDocument, UpdateInquiryMutation, UpdateInquiryMutationVariables } from '../../../../graphql/generated-types';
import { inquiryUpdateModalAtom } from '../../../../code/components/modals/inquiry-update/inquiryUpdateModalAtom';
import { InquiryUpdateModal } from '../../../../code/components/modals/inquiry-update/InquiryUpdateModal';
import { initApolloCache } from '../../../../code/components/providers/apollo/client/initApolloClient';
import { mapInquiryToInquiryUpdateFormData } from '../../../../code/utils/mappers/inquiryMapper';


describe('InquiryUpdateModal component', () => {

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
        createdAt: '',
        updatedAt: null,
    };

    function renderInMockContext(mocks?: ContextMocks) {
        const OpenModalButton = () => {
            const setModalState = useSetRecoilState(inquiryUpdateModalAtom);
            return (
                <button
                    data-testid='open-modal-button'
                    onClick={() => setModalState({
                        open: true,
                        inquiryData: mapInquiryToInquiryUpdateFormData(sampleInquiry),
                    })}
                />
            );
        };
        return render(
            <MockContextProvider mocks={mocks}>
                <OpenModalButton />
                <InquiryUpdateModal isMobile={false} />
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
            return screen.queryByLabelText(`t:inquiry.updateModal.title`);
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
        static get submitButton() {
            return screen.getByRole('button', { name: 't:form.common.update' });
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
                .typeInEditor('Sample updated description');
            await LocationFieldController.from(ViewUnderTest.inquiryLocationSelect)
                .selectLocation(data.location);
            await CategoryFieldController.from(ViewUnderTest.inquiryCategorySelect)
                .selectCategory(data.category);

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

    describe('inquiry update form', () => {

        const mockResponseGenerator = {
            success: () => ({
                request: {
                    query: UpdateInquiryDocument,
                    variables: {
                        inquiryId: sampleInquiry.id,
                        title: 'Updated inquiry title',
                        description: '[{"children":[{"type":"p","children":[{"text":"Sample updated description"}]}]}]',
                        location: {
                            placeId: 'ChIJ0RhONcBEFkcRv4pHdrW2a7Q',
                            main: 'Kraków',
                            secondary: 'Poland',
                            lat: 50,
                            lng: 20,
                        },
                        category: Category.DESIGNING,
                    } as UpdateInquiryMutationVariables,
                },
                result: {
                    data: {
                        updateInquiry: {
                            __typename: 'Inquiry',
                            id: sampleInquiry.id,
                            title: 'Updated inquiry title',
                            description: '[{"children":[{"type":"p","children":[{"text":"Sample updated description"}]}]}]',
                            location: {
                                placeId: 'ChIJ0RhONcBEFkcRv4pHdrW2a7Q',
                                main: 'Kraków',
                                secondary: 'Poland',
                                lat: 50,
                                lng: 20,
                            },
                            category: Category.DESIGNING,
                            author: sampleInquiry.author,
                            createdAt: '2020-08-16T12:00:00.000Z',
                            updatedAt: null,
                        },
                    } as UpdateInquiryMutation,
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

                await LocationFieldController.from(ViewUnderTest.inquiryLocationSelect)
                    .clearLocation().expectError('t:form.location.validation.required')
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

                await CategoryFieldController.from(ViewUnderTest.inquiryCategorySelect)
                    // .clearCategory().expectError('t:form.inquiryCategory.validation.required')
                    .selectCategory(Category.CARPENTRY).expectNoError();
            });

        });

        it('should successfully update inquiry and close modal', async () => {
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

            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if modal was closed
            await waitForElementToBeRemoved(ViewUnderTest.modal);

            // verify updated cache
            const updatedInquiry = mockResponse.result.data.updateInquiry;
            expect(cache.extract()).toEqual({
                [ inquiryCacheRecordKey ]: updatedInquiry, // <- updated inquiry record
                ROOT_QUERY: {
                    __typename: 'Query',
                    allInquiries: [ { __ref: inquiryCacheRecordKey } ],
                },
                ROOT_MUTATION: expect.any(Object),
            });
        });

    });

});
