/**
 * @jest-environment jsdom-sixteen
 *
 * ^ because of 'Error: Uncaught [TypeError: window.getSelection is not a function]'
 */

import React from 'react';
import { useSetRecoilState } from 'recoil/dist';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';

import { mockUseCurrentUserCachedData } from '../../../__mocks__/code/mockUseCurrentUserCachedData';
import { CurrencyAmountFieldController } from '../../../__utils__/field-controllers/CurrencyAmountFieldController';
import { EditorFieldController } from '../../../__utils__/field-controllers/EditorFieldController';
import { TextFieldController } from '../../../__utils__/field-controllers/TextFieldController';
import { TagsFieldController } from '../../../__utils__/field-controllers/TagsFieldController';
import { ContextMocks, MockContextProvider } from '../../../__utils__/mocks/MockContextProvider';

import { CreateProductDocument, CreateProductMutation, CreateProductMutationVariables, User } from '../../../../graphql/generated-types';
import { productCreateModalAtom } from '../../../../code/components/modals/product-create/productCreateModalAtom';
import { ProductCreateModal } from '../../../../code/components/modals/product-create/ProductCreateModal';
import { initApolloCache } from '../../../../code/components/providers/apollo/client/initApolloClient';
import { supportedCurrencies } from '../../../../code/config/supportedCurrencies';


describe('ProductCreateModal component', () => {

    const sampleUser: Partial<User> = {
        __typename: 'User',
        slug: 'sample-user',
        products: [],
    };

    beforeEach(() => {
        mockUseCurrentUserCachedData.mockReturnValue(sampleUser);
    });

    function renderInMockContext(mocks?: ContextMocks) {
        const OpenModalButton = () => {
            const setModalState = useSetRecoilState(productCreateModalAtom);
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
                <ProductCreateModal isMobile={false} />
            </MockContextProvider>,
        );
    }

    function initApolloTestCache() {
        const cache = initApolloCache();
        return cache.restore({
            [ cache.identify(sampleUser)! ]: sampleUser,
        });
    }

    class ViewUnderTest {
        static get modal() {
            return screen.queryByLabelText(`t:product.createModal.title`);
        }
        static get productNameInput() {
            return screen.getByLabelText('t:form.projectName.label', { selector: 'input' });
        }
        static get productDescriptionInput() {
            return screen.getByTestId('slate-editor');
        }
        static get productPriceInput() {
            return screen.getByLabelText(/t:form.productPrice.label/, { selector: 'input' });
        }
        static get productTagsInput() {
            return screen.getByLabelText(/t:form.productTags.label/, { selector: 'input' });
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
        static async fillAndSubmitForm(data: CreateProductMutationVariables) {
            await ViewUnderTest.openModal();

            await TextFieldController.from(ViewUnderTest.productNameInput)
                .type(data.name);
            await EditorFieldController.from(ViewUnderTest.productDescriptionInput)
                .typeInEditor('Sample description');
            await CurrencyAmountFieldController.from(ViewUnderTest.productPriceInput)
                .pasteAmount(`${data.price?.amount || ''}`)
                .selectCurrency(data.price?.currency || supportedCurrencies[ 0 ]);
            await TagsFieldController.from(ViewUnderTest.productTagsInput).removeAllTags()
                .addNewTags(data.tags);

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

    describe('product create form', () => {

        const mockResponseGenerator = {
            success: () => ({
                request: {
                    query: CreateProductDocument,
                    variables: {
                        name: 'Mist Grey Porcelain Floor Tile',
                        description: '[{"children":[{"type":"p","children":[{"text":"Sample description"}]}]}]',
                        price: { amount: 14.04, currency: 'PLN' },
                        tags: [ 'Bathroom' ],
                    } as CreateProductMutationVariables,
                },
                result: {
                    data: {
                        createProduct: {
                            __typename: 'Product',
                            id: 'sampleProjectId',
                            name: 'Mist Grey Porcelain Floor Tile',
                            description: '[{"children":[{"type":"p","children":[{"text":"Sample description"}]}]}]',
                            price: { amount: 14.04, currency: 'PLN' },
                            tags: [ 'Bathroom' ],
                            createdAt: '2020-08-06T12:00:00.000Z',
                        },
                    } as CreateProductMutation,
                },
            }),
        };

        describe('validation', () => {

            it('should validate productName input value', async () => {
                renderInMockContext();
                await ViewUnderTest.openModal();
                expect(ViewUnderTest.productNameInput).toHaveFocus();

                await TextFieldController.from(ViewUnderTest.productNameInput)
                    .type('').expectError('t:form.productName.validation.required')
                    .type('a'.repeat(2)).expectError('t:form.productName.validation.tooShort')
                    .type('a'.repeat(3)).expectNoError()
                    .paste('a'.repeat(256)).expectError('t:form.productName.validation.tooLong')
                    .paste('a'.repeat(255)).expectNoError()
                    .type('valid project name').expectNoError();
            });

            it('should validate productDescription input value', async () => {
                renderInMockContext();
                await ViewUnderTest.openModal();

                await EditorFieldController.from(ViewUnderTest.productDescriptionInput)
                    .typeInEditor('').expectError('t:form.productDescription.validation.required')
                    .typeInEditor('Valid description').expectNoError();
            });

            it('should validate productPrice input value', async () => {
                renderInMockContext();
                await ViewUnderTest.openModal();

                await CurrencyAmountFieldController.from(ViewUnderTest.productPriceInput)
                    .pasteAmount('10000000').expectError('t:form.productPrice.validation.tooHigh')
                    .pasteAmount('100000').expectNoError();
            });

            it('should validate productTags input value', async () => {
                renderInMockContext();
                await ViewUnderTest.openModal();

                await TagsFieldController.from(ViewUnderTest.productTagsInput)
                    .removeAllTags().addNewTag('a'.repeat(255)).expectNoError()
                    .removeAllTags().addNewTag('a'.repeat(256)).expectError('t:form.common.tags.validation.tooLong');
            });

        });

        it('should successfully create product and close modal', async () => {
            const cache = initApolloTestCache();
            const mockResponse = mockResponseGenerator.success();
            renderInMockContext({ mockResponses: [ mockResponse ], apolloCache: cache });

            const userCacheRecordKey = cache.identify(sampleUser)!;
            // verify initial cache records
            expect(cache.extract()).toEqual({
                [ userCacheRecordKey ]: sampleUser,
            });

            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if modal was closed
            await waitForElementToBeRemoved(ViewUnderTest.modal);

            // verify updated cache
            const createdProject = mockResponse.result.data.createProduct;
            const createdProductCacheRecordKey = cache.identify(createdProject)!;
            expect(cache.extract()).toEqual({
                [ createdProductCacheRecordKey ]: createdProject, // <- updated product record
                [ userCacheRecordKey ]: {
                    ...sampleUser,
                    products: [ { __ref: createdProductCacheRecordKey } ], // <- product list with new product ref
                },
                ROOT_MUTATION: expect.any(Object),
            });
        }, 7000);

    });

});
