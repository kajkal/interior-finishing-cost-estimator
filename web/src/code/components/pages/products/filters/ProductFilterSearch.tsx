import React from 'react';
import { SetterOrUpdater } from 'recoil/dist';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';

import { ProductsFiltersAtomValue } from './productsFiltersAtom';


export interface ProductFilterSearchProps {
    searchPhrase: string;
    setFilters: SetterOrUpdater<ProductsFiltersAtomValue>;
    className: string;
}

export function ProductFilterSearch({ searchPhrase, setFilters, className }: ProductFilterSearchProps): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <TextField
            value={searchPhrase}
            onChange={({ target: { value: searchPhrase } }) => {
                setFilters((prev) => ({ ...prev, searchPhrase }));
            }}

            InputProps={{
                disableUnderline: true,
                startAdornment: (
                    <InputAdornment position='start' style={{ marginTop: 'unset' }}>
                        <SearchIcon />
                    </InputAdornment>
                ),
                classes: {
                    input: classes.inputWithoutLabel,
                },
            }}

            className={className}
            placeholder={t('product.filters.searchPlaceholder')}
            aria-label={t('product.filters.searchAriaLabel')}
            type='search'
            variant='filled'
        />
    );
}

const useStyles = makeStyles({
    inputWithoutLabel: {
        padding: [ [ 12, 10 ] ] as unknown as number,
    },
});
