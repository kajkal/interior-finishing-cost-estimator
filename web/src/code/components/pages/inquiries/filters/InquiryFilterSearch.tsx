import React from 'react';
import { SetterOrUpdater } from 'recoil/dist';
import { useTranslation } from 'react-i18next';

import { FilterSearch } from '../../../common/filters/FilterSearch';
import { InquiriesFiltersAtomValue } from './inquiriesFiltersAtom';


export interface InquiryFilterSearchProps {
    searchPhrase: string;
    setFilters: SetterOrUpdater<InquiriesFiltersAtomValue>;
    className: string;
}

export function InquiryFilterSearch({ searchPhrase, setFilters, className }: InquiryFilterSearchProps): React.ReactElement {
    const { t } = useTranslation();

    return (
        <FilterSearch
            value={searchPhrase}
            onChange={({ target: { value: searchPhrase } }) => {
                setFilters((prev) => ({ ...prev, searchPhrase }));
            }}
            className={className}
            placeholder={t('inquiry.filters.searchPlaceholder')}
            aria-label={t('inquiry.filters.searchAriaLabel')}
        />
    );
}
