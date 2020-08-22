import React from 'react';
import { SetterOrUpdater } from 'recoil/dist';
import { useTranslation } from 'react-i18next';

import { categoryConfigMap, supportedCategories } from '../../../../config/supportedCategories';
import { Option } from '../../../../utils/hooks/useCurrentUserDataSelectors';
import { SelectedOptions } from '../../../../utils/filters/filtersUtils';
import { FilterOptions } from '../../../common/filters/FilterOptions';
import { InquiriesFiltersAtomValue } from './inquiriesFiltersAtom';
import { Category } from '../../../../../graphql/generated-types';


export interface InquiryFilterCategoriesProps {
    selectedCategories: SelectedOptions;
    setFilters: SetterOrUpdater<InquiriesFiltersAtomValue>;
    className: string;
}

export const InquiryFilterCategories = React.memo(
    function InquiryFilterCategories({ selectedCategories, setFilters, className }: InquiryFilterCategoriesProps): React.ReactElement {
        const { t } = useTranslation();
        const categories = React.useMemo<Option[]>(() => supportedCategories.map((name) => ({ name })), [ t ]);

        return (
            <FilterOptions
                options={categories}
                selectedOptions={selectedCategories}
                onChange={(selectedCategories) => {
                    setFilters((prev) => ({ ...prev, selectedCategories }));
                }}
                groupClassName={className}
                groupAriaLabel={t('inquiry.filters.categoriesAriaLabel')}
                selectAllOptionsChipLabel={t('inquiry.filters.selectAllCategories')}
                optionChipAriaLabel={({ name }) => t('inquiry.filters.toggleCategory', { categoryName: t(categoryConfigMap[ name as Category ].tKey) })}
                renderOptionChipLabel={({ name }) => t(categoryConfigMap[ name as Category ].tKey)}
            />
        );
    },
);
