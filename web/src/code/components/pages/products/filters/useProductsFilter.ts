import React from 'react';
import { DateTime } from 'luxon';

import { stripDiacritics } from '../../../../utils/filters/filtersUtils';
import { Product } from '../../../../../graphql/generated-types';
import { ProductsFiltersAtomValue } from './productsFiltersAtom';


export function useProductsFilter(productsToFilter: Product[], filters: ProductsFiltersAtomValue): Product[] {
    return React.useMemo(() => {
        const { selectedTags, searchPhrase, fromDate, toDate } = filters;
        const normalizedSearchPhrase = stripDiacritics(searchPhrase.trim().toLowerCase());

        return productsToFilter.filter((product) => {

            // filter by creation date
            const productCreationDate = DateTime.fromISO(product.createdAt);
            if ((fromDate && (productCreationDate < fromDate)) || (toDate && (productCreationDate > toDate))) {
                return false;
            }

            // filter by search
            const normalizedProductName = stripDiacritics(product.name.trim().toLowerCase());
            if (searchPhrase && !normalizedProductName.includes(normalizedSearchPhrase)) {
                return false;
            }

            // filter by tags
            return (selectedTags === 'ALL') || product.tags?.some((tag) => selectedTags.has(tag));
        });
    }, [ productsToFilter, filters ]);
}
