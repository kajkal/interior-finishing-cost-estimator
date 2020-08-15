import React from 'react';
import { SetterOrUpdater } from 'recoil/dist';
import { useTranslation } from 'react-i18next';

import { ProductsFiltersAtomValue } from './productsFiltersAtom';
import { FilterSearch } from '../../../common/filters/FilterSearch';


export interface ProductFilterSearchProps {
    searchPhrase: string;
    setFilters: SetterOrUpdater<ProductsFiltersAtomValue>;
    className: string;
}

export function ProductFilterSearch({ searchPhrase, setFilters, className }: ProductFilterSearchProps): React.ReactElement {
    const { t } = useTranslation();

    return (
        <FilterSearch
            value={searchPhrase}
            onChange={({ target: { value: searchPhrase } }) => {
                setFilters((prev) => ({ ...prev, searchPhrase }));
            }}
            className={className}
            placeholder={t('product.filters.searchPlaceholder')}
            aria-label={t('product.filters.searchAriaLabel')}
        />
    );
}
