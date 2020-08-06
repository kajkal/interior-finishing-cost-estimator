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
import { ContextMocks, MockContextProvider } from '../../../__utils__/MockContextProvider';
import { extendedUserEvent } from '../../../__utils__/extendedUserEvent';
import { InputValidator } from '../../../__utils__/InputValidator';
import slateEvent from '../../../__utils__/slateEvent';

import { CreateProductDocument, CreateProductMutation, CreateProductMutationVariables, User } from '../../../../graphql/generated-types';
import { productCreateModalAtom } from '../../../../code/components/modals/product-create/productCreateModalAtom';
import { ProductCreateModal } from '../../../../code/components/modals/product-create/ProductCreateModal';
import { initApolloCache } from '../../../../code/components/providers/apollo/client/initApolloClient';


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
            return screen.queryByLabelText(`t:modal.productCreate.title`);
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
            return screen.getByRole('button', { name: 't:modal.common.cancel' });
        }
        static get createButton() {
            return screen.getByRole('button', { name: 't:modal.productCreate.create' });
        }
        static async openModal() {
            userEvent.click(screen.getByTestId('open-modal-button'));
            await waitFor(() => expect(ViewUnderTest.modal).toBeInTheDocument());
        }
        static async fillAndSubmitForm(data: CreateProductMutationVariables) {
            await ViewUnderTest.openModal();
            await extendedUserEvent.type(this.productNameInput, data.name || '');
            slateEvent.typeInEditor('Sample description');
            await extendedUserEvent.typeNumber(ViewUnderTest.productPriceInput, `${data.price?.amount}`);
            for (const tag of data.tags) {
                await userEvent.type(ViewUnderTest.productTagsInput, tag);
                userEvent.click(screen.getByRole('option'));
                expect(screen.getByRole('button', { name: tag })).toBeVisible();
            }
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
                        tags: [ 'Bathroom' ],
                        price: { amount: 14.04, currency: 'PLN' },
                    } as CreateProductMutationVariables,
                },
                result: {
                    data: {
                        createProduct: {
                            __typename: 'Product',
                            id: 'sampleProjectId',
                            name: 'Mist Grey Porcelain Floor Tile',
                            description: '[{"children":[{"type":"p","children":[{"text":"Sample description"}]}]}]',
                            tags: [ 'Bathroom' ],
                            price: { amount: 14.04, currency: 'PLN' },
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

                await InputValidator.basedOn(ViewUnderTest.productNameInput)
                    .expectError('', 't:form.productName.validation.required')
                    .expectError('aa', 't:form.productName.validation.tooShort')
                    .expectError('a'.repeat(256), 't:form.productName.validation.tooLong')
                    .expectNoError('a'.repeat(255))
                    .expectNoError('valid project name');
            });

            it('should validate productDescription value', async () => {
                renderInMockContext();
                await ViewUnderTest.openModal();

                userEvent.click(ViewUnderTest.createButton);

                await waitFor(() => expect(ViewUnderTest.productDescriptionInput).toBeInvalid());
                expect(ViewUnderTest.productDescriptionInput).toHaveDescription('t:form.productDescription.validation.required');

                slateEvent.typeInEditor('Sample description');
                userEvent.click(ViewUnderTest.createButton);

                await waitFor(() => expect(ViewUnderTest.productDescriptionInput).toBeValid());
            });

            it('should validate productPrice input value', async () => {
                renderInMockContext();
                await ViewUnderTest.openModal();

                await extendedUserEvent.typeNumber(ViewUnderTest.productPriceInput, '10000000');
                await waitFor(() => expect(ViewUnderTest.productPriceInput).toBeInvalid());
                expect(ViewUnderTest.productPriceInput).toHaveDescription('t:form.productPrice.validation.tooHigh');

                await extendedUserEvent.typeNumber(ViewUnderTest.productPriceInput, '100000');
                await waitFor(() => expect(ViewUnderTest.productPriceInput).toBeValid());
                expect(ViewUnderTest.productPriceInput).toHaveDescription('');
            });

            it('should validate productTags input value', async () => {
                renderInMockContext();
                await ViewUnderTest.openModal();

                await userEvent.type(ViewUnderTest.productTagsInput, 'a'.repeat(256) + '{enter}');
                await waitFor(() => expect(ViewUnderTest.productTagsInput).toBeInvalid());
                expect(ViewUnderTest.productTagsInput).toHaveDescription('t:form.common.tags.validation.tooLong');

                await userEvent.type(ViewUnderTest.productTagsInput, '{backspace}'); // remove existing tag
                await userEvent.type(ViewUnderTest.productTagsInput, 'a'.repeat(255) + '{enter}');

                await waitFor(() => expect(ViewUnderTest.productTagsInput).toBeValid());
                expect(ViewUnderTest.productTagsInput).toHaveDescription('');
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
                'ROOT_MUTATION': expect.any(Object),
            });
        });

    });

});
