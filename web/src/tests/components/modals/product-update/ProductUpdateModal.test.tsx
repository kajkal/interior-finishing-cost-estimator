/**
 * @jest-environment jsdom-sixteen
 *
 * ^ because of 'Error: Uncaught [TypeError: window.getSelection is not a function]'
 */

import React from 'react';
import { useSetRecoilState } from 'recoil/dist';
import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { mockUseCurrentUserCachedData } from '../../../__mocks__/code/mockUseCurrentUserCachedData';
import { CurrencyAmountFieldController } from '../../../__utils__/field-controllers/CurrencyAmountFieldController';
import { EditorFieldController } from '../../../__utils__/field-controllers/EditorFieldController';
import { TextFieldController } from '../../../__utils__/field-controllers/TextFieldController';
import { TagsFieldController } from '../../../__utils__/field-controllers/TagsFieldController';
import { ContextMocks, MockContextProvider } from '../../../__utils__/MockContextProvider';

import { mapProductToProductUpdateFormData, productUpdateModalAtom } from '../../../../code/components/modals/product-update/productUpdateModalAtom';
import { Product, UpdateProductDocument, UpdateProductMutation, UpdateProductMutationVariables, User } from '../../../../graphql/generated-types';
import { ProductUpdateModal } from '../../../../code/components/modals/product-update/ProductUpdateModal';
import { initApolloCache } from '../../../../code/components/providers/apollo/client/initApolloClient';
import { supportedCurrencies } from '../../../../code/config/supportedCurrencies';


describe('ProductUpdateModal component', () => {

    const sampleUser: Partial<User> = {
        __typename: 'User',
        slug: 'sample-user',
        products: [ /* relation with sampleProduct is created on apollo cache level */ ],
    };

    const sampleProduct: Product = {
        __typename: 'Product',
        id: '5f09e24646904045d48e5598',
        name: 'Sample product name',
        description: JSON.stringify([ {
            children: [
                { type: 'p', children: [ { text: 'Sample description' } ] },
            ],
        } ]),
        price: { currency: 'PLN', amount: 4.5 },
        tags: [ 'Sample tag', 'Other tag' ],
        createdAt: '2020-08-06T12:00:00.000Z',
    };

    beforeEach(() => {
        mockUseCurrentUserCachedData.mockReturnValue(sampleUser);
    });

    function renderInMockContext(mocks?: ContextMocks) {
        const OpenModalButton = () => {
            const setModalState = useSetRecoilState(productUpdateModalAtom);
            return (
                <button
                    data-testid='open-modal-button'
                    onClick={() => setModalState({
                        open: true,
                        productData: mapProductToProductUpdateFormData(sampleProduct),
                    })}
                />
            );
        };
        return render(
            <MockContextProvider mocks={mocks}>
                <OpenModalButton />
                <ProductUpdateModal isMobile={false} />
            </MockContextProvider>,
        );
    }

    function initApolloTestCache() {
        const cache = initApolloCache();
        return cache.restore({
            [ cache.identify(sampleProduct)! ]: sampleProduct,
            [ cache.identify(sampleUser)! ]: {
                ...sampleUser,
                products: [ { __ref: cache.identify(sampleProduct) } ],
            },
        });
    }

    class ViewUnderTest {
        static get modal() {
            return screen.queryByLabelText(`t:product.updateModal.title`);
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
        static get submitButton() {
            return screen.getByRole('button', { name: 't:form.common.update' });
        }
        static async openModal() {
            userEvent.click(screen.getByTestId('open-modal-button'));
            await waitFor(() => expect(ViewUnderTest.modal).toBeVisible());
        }
        static async fillAndSubmitForm(data: UpdateProductMutationVariables) {
            await ViewUnderTest.openModal();

            await TextFieldController.from(ViewUnderTest.productNameInput)
                .type(data.name);
            await EditorFieldController.from(ViewUnderTest.productDescriptionInput)
                .typeInEditor('Sample updated description');
            await CurrencyAmountFieldController.from(ViewUnderTest.productPriceInput)
                .pasteAmount(`${data.price?.amount || ''}`)
                .selectCurrency(data.price?.currency || supportedCurrencies[ 0 ]);
            await TagsFieldController.from(ViewUnderTest.productTagsInput).removeAllTags()
                .addNewTags(data.tags);

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

    describe('product update form', () => {

        const mockResponseGenerator = {
            success: () => ({
                request: {
                    query: UpdateProductDocument,
                    variables: {
                        productId: sampleProduct.id,
                        name: 'Updated product name',
                        description: '[{"children":[{"type":"p","children":[{"text":"Sample updated description"}]}]}]',
                        price: null,
                        tags: null,
                    } as UpdateProductMutationVariables,
                },
                result: {
                    data: {
                        updateProduct: {
                            __typename: 'Product',
                            id: sampleProduct.id,
                            name: 'Updated product name',
                            description: '[{"children":[{"type":"p","children":[{"text":"Sample updated description"}]}]}]',
                            price: null,
                            tags: null,
                            createdAt: '2020-08-06T12:00:00.000Z',
                        },
                    } as UpdateProductMutation,
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

            it('should validate productDescription value', async () => {
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

        it('should successfully update product and close modal', async () => {
            const cache = initApolloTestCache();
            const mockResponse = mockResponseGenerator.success();
            renderInMockContext({ mockResponses: [ mockResponse ], apolloCache: cache });

            const userCacheRecordKey = cache.identify(sampleUser)!;
            const productCacheRecordKey = cache.identify(sampleProduct)!;

            // verify initial cache records
            expect(cache.extract()).toEqual({
                [ productCacheRecordKey ]: sampleProduct,
                [ userCacheRecordKey ]: {
                    ...sampleUser,
                    products: [ { __ref: productCacheRecordKey } ],
                },
            });

            await ViewUnderTest.fillAndSubmitForm(mockResponse.request.variables);

            // verify if modal was closed
            await waitForElementToBeRemoved(ViewUnderTest.modal);

            // verify updated cache
            const updatedProduct = mockResponse.result.data.updateProduct;
            expect(cache.extract()).toEqual({
                [ productCacheRecordKey ]: updatedProduct, // <- updated product record
                [ userCacheRecordKey ]: {
                    ...sampleUser,
                    products: [ { __ref: productCacheRecordKey } ], // <- no changes here
                },
                'ROOT_MUTATION': expect.any(Object),
            });
        });

    });

});
