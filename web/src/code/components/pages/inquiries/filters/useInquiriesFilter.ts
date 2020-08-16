import React from 'react';

import { Inquiry, UserDetailedDataFragment } from '../../../../../graphql/generated-types';
import { stripDiacritics } from '../../../../utils/filters/filtersUtils';
import { InquiriesFiltersAtomValue } from './inquiriesFiltersAtom';


export interface InquiryWithDistance {
    inquiry: Inquiry;
    distance?: number;
}

export function useInquiriesFilter(inquiriesToFilter: Inquiry[], filters: InquiriesFiltersAtomValue, currentUserData?: Pick<UserDetailedDataFragment, 'slug' | 'bookmarkedInquiries'>): InquiryWithDistance[] {
    return React.useMemo(() => {
        const { searchPhrase, location, selectedCategories, selectedType } = filters;
        const normalizedSearchPhrase = stripDiacritics(searchPhrase.trim().toLowerCase());
        const locationLatLng = location?.latLng && new window.google.maps.LatLng(location.latLng);

        return inquiriesToFilter
            .filter((inquiry) => {
                // filter by type (only when user is logged in):
                if (currentUserData && selectedType) {
                    if ((selectedType === 'OWNED') && !(currentUserData.slug === inquiry.author.userSlug)) {
                        return false;
                    }
                    if ((selectedType === 'BOOKMARKED') && !(currentUserData.bookmarkedInquiries?.includes(inquiry.id))) {
                        return false;
                    }
                }

                // filter by search
                const normalizedProductName = stripDiacritics(inquiry.title.trim().toLowerCase());
                if (searchPhrase && !normalizedProductName.includes(normalizedSearchPhrase)) {
                    return false;
                }

                // filter by category
                return (selectedCategories === 'ALL') || selectedCategories.has(inquiry.category);
            })
            .map((inquiry) => { // calculate distance
                if (locationLatLng) {
                    const inquiryLatLng = new window.google.maps.LatLng(inquiry.location.lat!, inquiry.location.lng!);

                    const distanceInM = window.google.maps.geometry.spherical.computeDistanceBetween(locationLatLng, inquiryLatLng);
                    return { inquiry, distance: distanceInM / 1000 };
                }
                return { inquiry };
            })
            .sort(({ distance: a }, { distance: b }) => ( // sort by distance
                (typeof a === 'number' && typeof b === 'number') ? (a - b) : 0
            ));
    }, [ inquiriesToFilter, filters, currentUserData ]);
}
