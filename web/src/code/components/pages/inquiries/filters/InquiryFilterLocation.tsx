import React from 'react';
import { SetterOrUpdater } from 'recoil/dist';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';

import { LocationField, LocationOption } from '../../../common/form-fields/location/LocationField';
import { getLocationLatLng } from '../../../../utils/mappers/locationMapper';
import { InquiriesFiltersAtomValue } from './inquiriesFiltersAtom';


export interface InquiryFilterLocationProps {
    location: LocationOption | null;
    setFilters: SetterOrUpdater<InquiriesFiltersAtomValue>;
    className: string;
}

export function InquiryFilterLocation({ location, setFilters, className }: InquiryFilterLocationProps): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <LocationField
            id='inquiry-filter-location'
            value={location}
            onChange={async (location) => {
                const latLng = location && await getLocationLatLng(location);
                setFilters((prev) => ({
                    ...prev,
                    location: location && { ...location, latLng } as LocationOption,
                }));
            }}
            className={className}
            placeholder={t('inquiry.filters.locationPlaceholder')}
            aria-label={t('inquiry.filters.locationAriaLabel')}
            autocompleteClasses={{
                inputRoot: classes.inputWithoutLabel,
            }}
        />
    );
}

const useStyles = makeStyles({
    inputWithoutLabel: {
        '&[class*="MuiFilledInput-root"]': {
            paddingTop: [ 0, '!important' ] as unknown as number,
            paddingBottom: [ 0, '!important' ] as unknown as number,
            '& input': {
                padding: [ [ 12, 10 ], '!important' ] as unknown as number,
            },
        },
    },
});
