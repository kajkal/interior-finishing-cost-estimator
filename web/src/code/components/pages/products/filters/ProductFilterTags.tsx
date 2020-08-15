import React from 'react';
import { SetterOrUpdater } from 'recoil/dist';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

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
        const classes = useStyles();
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
                optionChipAriaLabel={({ name: tagName }) => t('product.filters.toggleTag', { tagName })}
                renderOptionChipLabel={({ name: tagName, occurrenceCount }) => (
                    <>
                        <Typography variant='inherit'>
                            {tagName}
                        </Typography>
                        <Typography
                            variant='inherit'
                            color='textSecondary'
                            className={classes.occurrenceCount}
                        >
                            {`(${occurrenceCount})`}
                        </Typography>
                    </>
                )}
            />
        );
    },
);

const useStyles = makeStyles({
    occurrenceCount: {
        marginLeft: 4,
    },
});

