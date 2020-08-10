import { DateTime } from 'luxon';

import { Product } from '../../../../../graphql/generated-types';
import { ProductsFiltersAtomValue } from './productsFiltersAtom';


function stripDiacritics(string: string): string {
    return string.normalize !== undefined
        ? string.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        : string;
}

export function isTagSelected(selectedTags: ProductsFiltersAtomValue['selectedTags'], tagName: string): boolean {
    return areAllTagsSelected(selectedTags) || selectedTags.has(tagName);
}

export function isTagExclusivelySelected(selectedTags: ProductsFiltersAtomValue['selectedTags'], tagName: string): boolean {
    return !areAllTagsSelected(selectedTags) && selectedTags.has(tagName);
}

export function areAllTagsSelected(selectedTags: ProductsFiltersAtomValue['selectedTags']): selectedTags is 'ALL' {
    return selectedTags === 'ALL';
}

export function productFilter(productsToFilter: Product[], filters: ProductsFiltersAtomValue): Product[] {
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
        if ((selectedTags !== 'ALL') && (!product.tags?.some((tag) => selectedTags.has(tag)))) {
            if (!product.tags?.some((tag) => selectedTags.has(tag))) {
                return false;
            }
        }

        return true;
    });
}
