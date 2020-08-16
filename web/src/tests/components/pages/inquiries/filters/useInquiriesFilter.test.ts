import { renderHook } from '@testing-library/react-hooks';

import { useInquiriesFilter } from '../../../../../code/components/pages/inquiries/filters/useInquiriesFilter';
import { Author, Category, Inquiry, Location, UserDetailedDataFragment } from '../../../../../graphql/generated-types';
import { InquiriesFiltersAtomValue } from '../../../../../code/components/pages/inquiries/filters/inquiriesFiltersAtom';
import { LocationOption } from '../../../../../code/components/common/form-fields/location/LocationField';


class FakeLatLng {
    point: google.maps.LatLngLiteral;
    constructor(...args: unknown[]) {
        if (args.length === 1) {
            this.point = args[ 0 ] as google.maps.LatLngLiteral;
        } else {
            this.point = { lat: args[ 0 ], lng: args[ 1 ] } as google.maps.LatLngLiteral;
        }
    }
}

function simpleDistanceCalc({ point: p1 }: FakeLatLng, { point: p2 }: FakeLatLng) {
    const p = Math.PI / 180;
    const a = 0.5 - Math.cos((p2.lat - p1.lat) * p) / 2 + Math.cos(p1.lat * p) * Math.cos(p2.lat * p) * (1 - Math.cos((p2.lng - p1.lng) * p)) / 2;
    return 2 * 6371 * Math.asin(Math.sqrt(a)) * 1000;
}

describe('useInquiriesFilter hook', () => {

    const inquiry1: Pick<Inquiry, 'id' | 'title' | 'author' | 'category' | 'location'> = {
        id: 'I1',
        title: 'inquiry 1',
        location: {
            lat: 50.064495,
            lng: 19.923277,
        } as Location,
        author: {
            userSlug: 'user-1',
        } as Author,
        category: Category.DESIGNING,
    };
    const inquiry2: Pick<Inquiry, 'id' | 'title' | 'author' | 'category' | 'location'> = {
        id: 'I2',
        title: 'inquiry 2',
        location: {
            lat: 50.069302,
            lng: 19.926133,
        } as Location,
        author: {
            userSlug: 'user-2',
        } as Author,
        category: Category.ELECTRICAL,
    };
    const inquiry3: Pick<Inquiry, 'id' | 'title' | 'author' | 'category' | 'location'> = {
        id: 'I3',
        title: 'inquiry 3',
        location: {
            lat: 50.053832,
            lng: 19.935185,
        } as Location,
        author: {
            userSlug: 'user-3',
        } as Author,
        category: Category.ELECTRICAL,
    };
    const inquiriesToFilter = [ inquiry1, inquiry2, inquiry3 ] as Inquiry[];

    beforeEach(() => {
        window.google = {
            maps: {
                geometry: { spherical: { computeDistanceBetween: simpleDistanceCalc } },
                LatLng: FakeLatLng,
            },
        } as any;
    });

    function inquiryFilter(inquiriesToFilter: Inquiry[], filters: InquiriesFiltersAtomValue, currentUserData?: Pick<UserDetailedDataFragment, 'slug' | 'bookmarkedInquiries'>) {
        const { result } = renderHook(() => useInquiriesFilter(inquiriesToFilter, filters, currentUserData));
        return result.current;
    }

    const defaultFilterValue: InquiriesFiltersAtomValue = {
        searchPhrase: '',
        selectedCategories: 'ALL',
        selectedType: null,
        location: null,
    };

    const currentUser = {
        slug: 'user-1',
        bookmarkedInquiries: [ 'I3' ],
    };

    it('should filter inquires with default filter', () => {
        const filteredWithDefaultFilters = inquiryFilter(inquiriesToFilter, defaultFilterValue, currentUser);
        expect(filteredWithDefaultFilters).toEqual([
            { inquiry: inquiry1 },
            { inquiry: inquiry2 },
            { inquiry: inquiry3 },
        ]);
    });

    it('should filter inquires by name', () => {
        const filteredWithDefaultFilters = inquiryFilter(inquiriesToFilter, {
            ...defaultFilterValue,
            searchPhrase: 'inquiry 1',
        }, currentUser);
        expect(filteredWithDefaultFilters).toEqual([
            { inquiry: inquiry1 },
        ]);
    });

    it('should filter inquires by category', () => {
        const filteredWithDefaultFilters = inquiryFilter(inquiriesToFilter, {
            ...defaultFilterValue,
            selectedCategories: 'ALL',
        }, currentUser);
        expect(filteredWithDefaultFilters).toEqual([
            { inquiry: inquiry1 },
            { inquiry: inquiry2 },
            { inquiry: inquiry3 },
        ]);

        const filteredByCategory1 = inquiryFilter(inquiriesToFilter, {
            ...defaultFilterValue,
            selectedCategories: new Set([ Category.ELECTRICAL ]),
        }, currentUser);
        expect(filteredByCategory1).toEqual([
            { inquiry: inquiry2 },
            { inquiry: inquiry3 },
        ]);

        const filteredByCategory2 = inquiryFilter(inquiriesToFilter, {
            ...defaultFilterValue,
            selectedCategories: new Set([ Category.DESIGNING ]),
        }, currentUser);
        expect(filteredByCategory2).toEqual([
            { inquiry: inquiry1 },
        ]);
    });

    it('should filter inquires by type', () => {
        const filteredWithDefaultFilters = inquiryFilter(inquiriesToFilter, {
            ...defaultFilterValue,
            selectedType: null,
        }, currentUser);
        expect(filteredWithDefaultFilters).toEqual([
            { inquiry: inquiry1 },
            { inquiry: inquiry2 },
            { inquiry: inquiry3 },
        ]);

        const filteredByOwnInquiries = inquiryFilter(inquiriesToFilter, {
            ...defaultFilterValue,
            selectedType: 'OWNED',
        }, currentUser);
        expect(filteredByOwnInquiries).toEqual([
            { inquiry: inquiry1 },
        ]);
        const filteredByOwnInquiriesWhenLogout = inquiryFilter(inquiriesToFilter, {
            ...defaultFilterValue,
            selectedType: 'OWNED',
        });
        expect(filteredByOwnInquiriesWhenLogout).toEqual([
            { inquiry: inquiry1 },
            { inquiry: inquiry2 },
            { inquiry: inquiry3 },
        ]);

        const filteredByBookmarkedInquiries = inquiryFilter(inquiriesToFilter, {
            ...defaultFilterValue,
            selectedType: 'BOOKMARKED',
        }, currentUser);
        expect(filteredByBookmarkedInquiries).toEqual([
            { inquiry: inquiry3 },
        ]);
        const filteredByBookmarkedInquiriesWhenLogout = inquiryFilter(inquiriesToFilter, {
            ...defaultFilterValue,
            selectedType: 'BOOKMARKED',
        });
        expect(filteredByBookmarkedInquiriesWhenLogout).toEqual([
            { inquiry: inquiry1 },
            { inquiry: inquiry2 },
            { inquiry: inquiry3 },
        ]);
    });

    it('should calculate distance and sort inquires by it', () => {
        const withDistance = inquiryFilter(inquiriesToFilter, {
            ...defaultFilterValue,
            location: {
                latLng: {
                    lat: 50.061692,
                    lng: 19.937347,
                },
            } as LocationOption,
        }, currentUser);
        expect(withDistance).toEqual([
            { inquiry: inquiry3, distance: expect.any(Number) },
            { inquiry: inquiry1, distance: expect.any(Number) },
            { inquiry: inquiry2, distance: expect.any(Number) },
        ]);
    });

});
