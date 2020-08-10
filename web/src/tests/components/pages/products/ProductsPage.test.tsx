/**
 * @jest-environment jsdom-sixteen
 *
 * ^ because of 'Error: Uncaught [TypeError: window.getSelection is not a function]'
 */

import React from 'react';
import { useRecoilValue } from 'recoil/dist';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { mockUseCurrentUserCachedData } from '../../../__mocks__/code/mockUseCurrentUserCachedData';
import { ContextMocks, MockContextProvider } from '../../../__utils__/MockContextProvider';

import { productCreateModalAtom, ProductCreateModalAtomValue } from '../../../../code/components/modals/product-create/productCreateModalAtom';
import { productDeleteModalAtom, ProductDeleteModalAtomValue } from '../../../../code/components/modals/product-delete/productDeleteModalAtom';
import { productUpdateModalAtom, ProductUpdateModalAtomValue } from '../../../../code/components/modals/product-update/productUpdateModalAtom';
import { ProductsPage } from '../../../../code/components/pages/products/ProductsPage';
import { Product, User } from '../../../../graphql/generated-types';


describe('ProductsPage component', () => {

    let createState: ProductCreateModalAtomValue;
    let updateState: ProductUpdateModalAtomValue;
    let deleteState: ProductDeleteModalAtomValue;

    const product1: Product = {
        id: 'id_1',
        name: 'Product 1',
        description: '[{"children":[{"type":"p","children":[{"text":"Sample description 1"}]}]}]',
        price: { currency: 'PLN', amount: 4.5 },
        tags: [ 'tag a' ],
        createdAt: '2020-08-05T12:00:00.000Z',
        updatedAt: '2020-08-06T12:05:00.000Z',
    };
    const product2: Product = {
        id: 'id_2',
        name: 'Product 2',
        description: '[{"children":[{"type":"p","children":[{"text":"Sample description 2"}]}]}]',
        tags: null,
        createdAt: '2020-08-06T12:00:00.000Z',
    };
    const product3: Product = {
        id: 'id_3',
        name: 'Product 3',
        description: '[{"children":[{"type":"p","children":[{"text":"Sample description 3"}]}]}]',
        tags: [ 'tag a', 'tag b' ],
        createdAt: '2020-08-07T12:00:00.000Z',
    };
    const sampleUser: Partial<User> = {
        __typename: 'User',
        slug: 'sample-user',
        products: [ product1, product2, product3 ],
    };

    beforeEach(() => {
        mockUseCurrentUserCachedData.mockReturnValue(sampleUser);
    });

    function renderInMockContext(mocks?: ContextMocks) {
        const Handle = () => {
            createState = useRecoilValue(productCreateModalAtom);
            updateState = useRecoilValue(productUpdateModalAtom);
            deleteState = useRecoilValue(productDeleteModalAtom);
            return null;
        };
        return render(
            <MockContextProvider mocks={mocks}>
                <Handle />
                <ProductsPage />
            </MockContextProvider>,
        );
    }

    class ViewUnderTest {
        static get filterSearch() {
            return screen.getByPlaceholderText('t:product.filters.searchPlaceholder');
        }
        static get filterFromDate() {
            return screen.getByLabelText('t:product.filters.fromDate', { selector: 'input' });
        }
        static get filterToDate() {
            return screen.getByLabelText('t:product.filters.toDate', { selector: 'input' });
        }
        static get filterTags() {
            return screen.getByRole('group', { name: 't:product.filters.tagsAriaLabel' });
        }
        static get createProductButton() {
            return screen.getByRole('button', { name: 't:product.addProduct' });
        }
        static getProductPanel(name: string) {
            return screen.getByRole('button', { name: new RegExp(name) });
        }
    }

    it('should render create product button', async () => {
        renderInMockContext();

        expect(ViewUnderTest.createProductButton).toBeVisible();

        userEvent.click(ViewUnderTest.createProductButton);

        await waitFor(() => expect(createState).toEqual({ open: true}));
    });

    it('should render page with filters and product list', async () => {
        renderInMockContext();

        // verify if filters are visible
        expect(ViewUnderTest.filterSearch).toBeVisible();
        expect(ViewUnderTest.filterFromDate).toBeVisible();
        expect(ViewUnderTest.filterToDate).toBeVisible();
        expect(ViewUnderTest.filterTags).toBeVisible();

        // verify if all product panels are visible
        const panel1 = ViewUnderTest.getProductPanel('Product 1');
        const panel2 = ViewUnderTest.getProductPanel('Product 2');
        const panel3 = ViewUnderTest.getProductPanel('Product 3');
        expect(panel1).toBeVisible();
        expect(panel2).toBeVisible();
        expect(panel3).toBeVisible();

        // verify panel 1
        userEvent.click(panel1);
        expect(panel1).toHaveTextContent('14.50PLNtag a'); // price + tags
        expect(screen.getByText('Sample description 1')).toBeVisible();

        // verify delete button
        userEvent.click(screen.getByRole('button', { name: 't:form.common.delete' }));
        await waitFor(() => {
            expect(deleteState).toEqual({
                open: true,
                productData: {
                    id: product1.id,
                    name: product1.name,
                },
            });
        });

        // verify update button
        userEvent.click(screen.getByRole('button', { name: 't:form.common.update' }));
        await waitFor(() => {
            expect(updateState).toEqual({
                open: true,
                productData: {
                    productId: product1.id,
                    name: product1.name,
                    description: JSON.parse(product1.description),
                    price: { currency: 'PLN', amount: 4.5 },
                    tags: [ { name: 'tag a' } ],
                },
            });
        });

        // verify history button
        expect(screen.getByRole('button', { name: 't:product.productHistory' })).toBeVisible();
    });

});
