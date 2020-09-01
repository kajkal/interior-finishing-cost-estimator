import React from 'react';
import userEvent from '@testing-library/user-event';
import { useSetRecoilState } from 'recoil/dist';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';

import { mockUseCurrentUserCachedData } from '../../../__mocks__/code/mockUseCurrentUserCachedData';
import { ContextMocks, MockContextProvider } from '../../../__utils__/mocks/MockContextProvider';
import { generator } from '../../../__utils__/generator';

import { DeleteProductDocument, DeleteProductMutation, DeleteProductMutationVariables } from '../../../../graphql/generated-types';
import { productDeleteModalAtom } from '../../../../code/components/modals/product-delete/productDeleteModalAtom';
import { ProductDeleteModal } from '../../../../code/components/modals/product-delete/ProductDeleteModal';
import { initApolloCache } from '../../../../code/components/providers/apollo/client/initApolloClient';


describe('ProductDeleteModal component', () => {

    const sampleUser = generator.user();
    const sampleProduct = generator.product({ id: '5f09e24646904045d48e5598' });

    beforeEach(() => {
        mockUseCurrentUserCachedData.mockReturnValue(sampleUser);
    });

    function renderInMockContext(mocks?: ContextMocks) {
        const OpenModalButton = () => {
            const setModalState = useSetRecoilState(productDeleteModalAtom);
            return (
                <button
                    data-testid='open-modal-button'
                    onClick={() => setModalState({
                        open: true,
                        productData: {
                            id: sampleProduct.id,
                            name: sampleProduct.name,
                        },
                    })}
                />
            );
        };
        return render(
            <MockContextProvider mocks={mocks}>
                <OpenModalButton />
                <ProductDeleteModal />
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
            return screen.queryByLabelText(`t:product.deleteModal.title:{"productName":"${sampleProduct.name}"}`);
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

    describe('product delete form', () => {

        const mockResponseGenerator = {
            success: () => ({
                request: {
                    query: DeleteProductDocument,
                    variables: {
                        productId: sampleProduct.id,
                    } as DeleteProductMutationVariables,
                },
                result: {
                    data: {
                        deleteProduct: true,
                    } as DeleteProductMutation,
                },
            }),
        };


        it('should successfully delete product and close modal', async () => {
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

            ViewUnderTest.openModal();
            userEvent.click(ViewUnderTest.deleteButton);

            // verify if modal was closed
            await waitForElementToBeRemoved(ViewUnderTest.modal);

            // verify updated cache
            expect(cache.extract()).toEqual({
                // <- removed product record
                [ userCacheRecordKey ]: {
                    ...sampleUser,
                    products: [], // <- products list without deleted product
                },
                ROOT_MUTATION: expect.any(Object),
            });
        });

    });

});
