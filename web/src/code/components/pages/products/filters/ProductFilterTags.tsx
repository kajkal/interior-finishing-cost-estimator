import React from 'react';
import { SetterOrUpdater } from 'recoil/dist';
import { useTranslation } from 'react-i18next';

import { Option } from '../../../../utils/hooks/useCurrentUserDataSelectors';
import { SelectedOptions } from '../../../../utils/filters/filtersUtils';
import { FilterOptions } from '../../../common/filters/FilterOptions';
import { ProductsFiltersAtomValue } from './productsFiltersAtom';


export interface ProductFilterTagsProps {
    tags: Option[];
    selectedTags: SelectedOptions;
    setFilters: SetterOrUpdater<ProductsFiltersAtomValue>;
    className: string;
}

export const ProductFilterTags = React.memo(
    function ProductFilterTags({ tags, selectedTags, setFilters, className }: ProductFilterTagsProps): React.ReactElement {
        const { t } = useTranslation();

        return (
            <FilterOptions
                options={tags}
                selectedOptions={selectedTags}
                onChange={(selectedTags) => {
                    setFilters((prev) => ({ ...prev, selectedTags }));
                }}
                groupClassName={className}
                groupAriaLabel={t('product.filters.tagsAriaLabel')}
                selectAllOptionsChipLabel={t('product.filters.selectAllTags')}
                optionChipAriaLabel={(tagName) => t('product.filters.toggleTag', { tagName })}
            />
        );
    },
);
