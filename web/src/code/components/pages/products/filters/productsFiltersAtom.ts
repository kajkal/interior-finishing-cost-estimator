import { DateTime } from 'luxon';
import { atom } from 'recoil/dist';


export interface ProductsFiltersAtomValue {
    selectedTags: 'ALL' | Set<string>;
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
