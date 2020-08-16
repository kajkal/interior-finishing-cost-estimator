import { atom } from 'recoil/dist';

import { LocationOption } from '../../../common/form-fields/location/LocationField';
import { SelectedOptions } from '../../../../utils/filters/filtersUtils';


export interface InquiriesFiltersAtomValue {
    selectedCategories: SelectedOptions;
    selectedType: 'OWNED' | 'BOOKMARKED' | null;
    searchPhrase: string,
    location: LocationOption | null;
}

export const inquiriesFiltersAtom = atom<InquiriesFiltersAtomValue>({
    key: 'inquiriesFiltersAtom',
    default: {
        selectedCategories: 'ALL',
        selectedType: null,
        searchPhrase: '',
        location: null,
    },
});
