import { DateTime } from 'luxon';
import { renderHook } from '@testing-library/react-hooks';

import { generator } from '../../../../__utils__/generator';

import { ProductsFiltersAtomValue } from '../../../../../code/components/pages/products/filters/productsFiltersAtom';
import { useProductsFilter } from '../../../../../code/components/pages/products/filters/useProductsFilter';
import { Product } from '../../../../../graphql/generated-types';


describe('useProductsFilter hook', () => {

    const product1 = generator.product({
        name: 'ąćęńóśźż',
        createdAt: '2020-08-05T12:00:00.000Z',
        tags: null,
    });
    const product2 = generator.product({
        name: 'product X',
        createdAt: '2020-08-06T12:00:00.000Z',
        tags: [ 'tag a' ],
    });
    const product3 = generator.product({
        name: 'product Y',
        createdAt: '2020-08-07T12:00:00.000Z',
        tags: [ 'tag a', 'tag b' ],
    });

    const defaultFilterValue: ProductsFiltersAtomValue = {
        selectedTags: 'ALL',
        searchPhrase: '',
        fromDate: null,
        toDate: null,
    };

    class FiltersVerifier {
        constructor(public filters: ProductsFiltersAtomValue) {
        }
        static withFilters(filters?: Partial<ProductsFiltersAtomValue>) {
            return new this({ ...defaultFilterValue, ...filters });
        }
        expectResult(expectedProducts: Product[]) {
            const { result: { current: filteredProducts } } = renderHook(() => (
                useProductsFilter([ product1, product2, product3 ], this.filters)
            ));
            expect(filteredProducts).toEqual(expectedProducts);
        }
    }

    it('should filter products with default filter', () => {
        FiltersVerifier
            .withFilters()
            .expectResult([ product1, product2, product3 ]);
    });

    it('should filter products by name', () => {
        FiltersVerifier
            .withFilters({ searchPhrase: 'acenoszz' })
            .expectResult([ product1 ]);

        FiltersVerifier
            .withFilters({ searchPhrase: 'Product' })
            .expectResult([ product2, product3 ]);
    });

    it('should filter products by creation date', () => {
        FiltersVerifier
            .withFilters({ fromDate: DateTime.fromISO('2020-08-06T00:00:00.000Z') })
            .expectResult([ product2, product3 ]);

        FiltersVerifier
            .withFilters({ toDate: DateTime.fromISO('2020-08-07T00:00:00.000Z') })
            .expectResult([ product1, product2 ]);

        FiltersVerifier
            .withFilters({
                fromDate: DateTime.fromISO('2020-08-06T00:00:00.000Z'),
                toDate: DateTime.fromISO('2020-08-07T00:00:00.000Z'),
            })
            .expectResult([ product2 ]);
    });

    it('should filter products by tags', () => {
        FiltersVerifier
            .withFilters({ selectedTags: 'ALL' })
            .expectResult([ product1, product2, product3 ]);

        FiltersVerifier
            .withFilters({ selectedTags: new Set([ 'tag a' ]) })
            .expectResult([ product2, product3 ]);

        FiltersVerifier
            .withFilters({ selectedTags: new Set([ 'tag b' ]) })
            .expectResult([ product3 ]);
    });

});
