/**
 * @jest-environment jsdom-sixteen
 *
 * ^ because of 'Error: Uncaught [TypeError: window.getSelection is not a function]'
 */

import React from 'react';
import { useSetRecoilState } from 'recoil';
import userEvent from '@testing-library/user-event';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';

import { ContextMocks, MockContextProvider } from '../../../__utils__/MockContextProvider';

import { ProductModal } from '../../../../code/components/modals/product/ProductModal';
import { productModalAtom } from '../../../../code/components/modals/product/productModalAtom';
import { Product } from '../../../../graphql/generated-types';


describe('ProductModal component', () => {

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

    function renderInMockContext(mocks?: ContextMocks) {
        const OpenModalButton = () => {
            const setModalState = useSetRecoilState(productModalAtom);
            return (
                <button
                    data-testid='open-modal-button'
                    onClick={() => setModalState({
                        open: true,
                        productData: sampleProduct,
                    })}
                />
            );
        };
        return render(
            <MockContextProvider mocks={mocks}>
                <OpenModalButton />
                <ProductModal isMobile={false} />
            </MockContextProvider>,
        );
    }

    class ViewUnderTest {
        static get modal() {
            return screen.queryByLabelText(new RegExp(sampleProduct.name));
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
