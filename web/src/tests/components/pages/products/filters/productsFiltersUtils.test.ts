import { areAllTagsSelected, isTagExclusivelySelected, isTagSelected, productFilter } from '../../../../../code/components/pages/products/filters/productsFiltersUtils';
import { Product } from '../../../../../graphql/generated-types';
import { DateTime } from 'luxon';


describe('productsFiltersUtils file', () => {

    describe('isTagSelected function', () => {

        it('should return true only when tag is selected', () => {
            expect(isTagSelected('ALL', 'tag a')).toBe(true);
            expect(isTagSelected(new Set([ 'tag a' ]), 'tag a')).toBe(true);
            expect(isTagSelected(new Set(), 'tag a')).toBe(false);
        });

    });

    describe('isTagExclusivelySelected function', () => {

        it('should return true only when tag is exclusively selected', () => {
            expect(isTagExclusivelySelected('ALL', 'tag a')).toBe(false);
            expect(isTagExclusivelySelected(new Set([ 'tag a' ]), 'tag a')).toBe(true);
            expect(isTagExclusivelySelected(new Set(), 'tag a')).toBe(false);
        });

    });

    describe('areAllTagsSelected function', () => {

        it('should return true only when all tags are selected', () => {
            expect(areAllTagsSelected('ALL')).toBe(true);
            expect(areAllTagsSelected(new Set([ 'tag a' ]))).toBe(false);
            expect(areAllTagsSelected(new Set())).toBe(false);
        });

    });

    describe('productFilter function', () => {

        const product1: Pick<Product, 'name' | 'tags' | 'createdAt'> = {
            name: 'ąćęńóśźż',
            createdAt: '2020-08-05T12:00:00.000Z',
            tags: null,
        };
        const product2: Pick<Product, 'name' | 'tags' | 'createdAt'> = {
            name: 'product X',
            createdAt: '2020-08-06T12:00:00.000Z',
            tags: [ 'tag a' ],
        };
        const product3: Pick<Product, 'name' | 'tags' | 'createdAt'> = {
            name: 'product Y',
            createdAt: '2020-08-07T12:00:00.000Z',
            tags: [ 'tag a', 'tag b' ],
        };
        const productsToFilter = [ product1, product2, product3 ] as Product[];

        it('should filter products with default filter', () => {
            const filteredWithDefaultFilters = productFilter(productsToFilter, {
                searchPhrase: '',
                selectedTags: 'ALL',
                fromDate: null,
                toDate: null,
            });
            expect(filteredWithDefaultFilters).toEqual([ product1, product2, product3 ]);
        });

        it('should filter products by name', () => {
            const filteredByNameWithDiacritics = productFilter(productsToFilter, {
                searchPhrase: 'acenoszz',
                selectedTags: 'ALL',
                fromDate: null,
                toDate: null,
            });
            expect(filteredByNameWithDiacritics).toEqual([ product1 ]);

            const filteredByName = productFilter(productsToFilter, {
                searchPhrase: 'Product',
                selectedTags: 'ALL',
                fromDate: null,
                toDate: null,
            });
            expect(filteredByName).toEqual([ product2, product3 ]);
        });

        it('should filter products by creation date', () => {
            const filteredByFromDate = productFilter(productsToFilter, {
                searchPhrase: '',
                selectedTags: 'ALL',
                fromDate: DateTime.fromISO('2020-08-06T00:00:00.000Z'),
                toDate: null,
            });
            expect(filteredByFromDate).toEqual([ product2, product3 ]);

            const filteredByToDate = productFilter(productsToFilter, {
                searchPhrase: '',
                selectedTags: 'ALL',
                fromDate: null,
                toDate: DateTime.fromISO('2020-08-07T00:00:00.000Z'),
            });
            expect(filteredByToDate).toEqual([ product1, product2 ]);

            const filteredByBothDate = productFilter(productsToFilter, {
                searchPhrase: '',
                selectedTags: 'ALL',
                fromDate: DateTime.fromISO('2020-08-06T00:00:00.000Z'),
                toDate: DateTime.fromISO('2020-08-07T00:00:00.000Z'),
            });
            expect(filteredByBothDate).toEqual([ product2 ]);
        });

        it('should filter products by tags', () => {
            const filteredByAllTags = productFilter(productsToFilter, {
                searchPhrase: '',
                selectedTags: 'ALL',
                fromDate: null,
                toDate: null,
            });
            expect(filteredByAllTags).toEqual([ product1, product2, product3 ]);

            const filteredByAllTagA = productFilter(productsToFilter, {
                searchPhrase: '',
                selectedTags: new Set([ 'tag a' ]),
                fromDate: null,
                toDate: null,
            });
            expect(filteredByAllTagA).toEqual([ product2, product3 ]);

            const filteredByAllTagB = productFilter(productsToFilter, {
                searchPhrase: '',
                selectedTags: new Set([ 'tag b' ]),
                fromDate: null,
                toDate: null,
            });
            expect(filteredByAllTagB).toEqual([ product3 ]);
        });

    });

});
