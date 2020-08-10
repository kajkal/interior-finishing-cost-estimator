import React from 'react';
import { DateTime } from 'luxon';
import { SetterOrUpdater } from 'recoil/dist';
import { useTranslation } from 'react-i18next';

import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';

import { ProductsDatesStatistics } from '../../../../utils/hooks/useCurrentUserDataSelectors';
import { DateField } from '../../../common/form-fields/date/DateField';
import { ProductsFiltersAtomValue } from './productsFiltersAtom';


export interface ProductFilterDateProps {
    date: DateTime | null;
    relatedField: 'fromDate' | 'toDate';
    productsDatesStatistics: ProductsDatesStatistics | undefined;
    setFilters: SetterOrUpdater<ProductsFiltersAtomValue>;
    className: string;
}

export function ProductFilterDate({ date, relatedField, productsDatesStatistics, setFilters, className }: ProductFilterDateProps): React.ReactElement {
    const { t } = useTranslation();
    const inputProps = React.useMemo(() => productsDatesStatistics && ({
        min: DateTime.fromISO(productsDatesStatistics.min).toISODate(),
        max: DateTime.fromISO(productsDatesStatistics.max).toISODate(),
    }), [ productsDatesStatistics ]);
    const fieldId = `${relatedField}-input`;

    return (
        <DateField
            id={fieldId}
            inputProps={inputProps}
            aria-label={t('product.filters.dateAriaLabel')}

            value={date ? date.toISODate() : ''}
            onChange={({ target: { value: rawDate } }) => {
                setFilters((prev) => ({
                    ...prev,
                    [ relatedField ]: DateTime.fromISO(rawDate),
                }));
            }}

            className={className}
            InputProps={{
                startAdornment: (
                    <InputAdornment position='start' style={{ marginTop: 'unset' }}>
                        <InputLabel htmlFor={fieldId}>
                            {
                                (relatedField === 'fromDate')
                                    ? t('product.filters.fromDate')
                                    : t('product.filters.toDate')
                            }
                        </InputLabel>
                    </InputAdornment>
                ),
            }}
        />
    );
}
