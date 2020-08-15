import { DateTime } from 'luxon';
import { atom } from 'recoil/dist';

import { SelectedOptions } from '../../../../utils/filters/filtersUtils';


export interface ProductsFiltersAtomValue {
    selectedTags: SelectedOptions;
    searchPhrase: string,
    fromDate: DateTime | null,
    toDate: DateTime | null,
}

export const productsFiltersAtom = atom<ProductsFiltersAtomValue>({
    key: 'productsFilters',
    default: {
        selectedTags: 'ALL',
        searchPhrase: '',
        fromDate: null,
        toDate: null,
    },
});
