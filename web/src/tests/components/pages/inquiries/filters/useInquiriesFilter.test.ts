import { renderHook } from '@testing-library/react-hooks';

import { generator } from '../../../../__utils__/generator';

import { InquiryWithDistance, useInquiriesFilter } from '../../../../../code/components/pages/inquiries/filters/useInquiriesFilter';
import { InquiriesFiltersAtomValue } from '../../../../../code/components/pages/inquiries/filters/inquiriesFiltersAtom';
import { mapLocationToLocationOption } from '../../../../../code/utils/mappers/locationMapper';
import { Category, UserDetailedDataFragment } from '../../../../../graphql/generated-types';


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

    const inquiry1 = generator.inquiry({
        title: 'inquiry 1',
        location: generator.location({ lat: 50.064495, lng: 19.923277 }),
        author: generator.author({ userSlug: 'user-1' }),
        category: Category.DESIGNING,
    });
    const inquiry2 = generator.inquiry({
        title: 'inquiry 2',
        location: generator.location({ lat: 50.069302, lng: 19.926133 }),
        author: generator.author({ userSlug: 'user-2' }),
        category: Category.ELECTRICAL,
    });
    const inquiry3 = generator.inquiry({
        title: 'inquiry 3',
        location: generator.location({ lat: 50.053832, lng: 19.935185 }),
        author: generator.author({ userSlug: 'user-3' }),
        category: Category.ELECTRICAL,
    });

    const defaultFilterValue: InquiriesFiltersAtomValue = {
        searchPhrase: '',
        selectedCategories: 'ALL',
        selectedType: null,
        location: null,
    };

    beforeEach(() => {
        window.google = {
            maps: {
                geometry: { spherical: { computeDistanceBetween: simpleDistanceCalc } },
                LatLng: FakeLatLng,
            },
        } as any;
    });

    class FiltersVerifier {
        filters: InquiriesFiltersAtomValue;
        currentUser?: UserDetailedDataFragment;
        constructor(filters: InquiriesFiltersAtomValue) {
            this.filters = filters;
        }
        static withFilters(filters?: Partial<InquiriesFiltersAtomValue>) {
            return new this({ ...defaultFilterValue, ...filters });
        }
        withCurrentUser(currentUser?: UserDetailedDataFragment) {
            this.currentUser = currentUser;
            return this;
        }
        expectResult(expectedInquiries: InquiryWithDistance[]) {
            const { result: { current: filteredInquiries } } = renderHook(() => (
                useInquiriesFilter([ inquiry1, inquiry2, inquiry3 ], this.filters, this.currentUser)
            ));
            expect(filteredInquiries).toEqual(expectedInquiries);
        }
    }

    it('should filter inquires with default filter', () => {
        FiltersVerifier
            .withFilters()
            .expectResult([
                { inquiry: inquiry1 },
                { inquiry: inquiry2 },
                { inquiry: inquiry3 },
            ]);
    });

    it('should filter inquires by name', () => {
        FiltersVerifier
            .withFilters({ searchPhrase: '' })
            .expectResult([
                { inquiry: inquiry1 },
                { inquiry: inquiry2 },
                { inquiry: inquiry3 },
            ]);

        FiltersVerifier
            .withFilters({ searchPhrase: inquiry1.title })
            .expectResult([
                { inquiry: inquiry1 },
            ]);
    });

    it('should filter inquires by category', () => {
        FiltersVerifier
            .withFilters({ selectedCategories: 'ALL' })
            .expectResult([
                { inquiry: inquiry1 },
                { inquiry: inquiry2 },
                { inquiry: inquiry3 },
            ]);

        FiltersVerifier
            .withFilters({ selectedCategories: new Set([ Category.ELECTRICAL ]) })
            .expectResult([
                { inquiry: inquiry2 },
                { inquiry: inquiry3 },
            ]);

        FiltersVerifier
            .withFilters({ selectedCategories: new Set([ Category.DESIGNING ]) })
            .expectResult([
                { inquiry: inquiry1 },
            ]);
    });

    it('should filter inquires by type', () => {
        // verify no type
        FiltersVerifier
            .withFilters({ selectedType: null })
            .expectResult([
                { inquiry: inquiry1 },
                { inquiry: inquiry2 },
                { inquiry: inquiry3 },
            ]);

        // verify 'OWNED' type
        FiltersVerifier
            .withFilters({ selectedType: 'OWNED' })
            .withCurrentUser(generator.user({ slug: inquiry1.author.userSlug }))
            .expectResult([
                { inquiry: inquiry1 },
            ]);
        FiltersVerifier
            .withFilters({ selectedType: 'OWNED' })
            .expectResult([
                { inquiry: inquiry1 },
                { inquiry: inquiry2 },
                { inquiry: inquiry3 },
            ]);

        // verify 'BOOKMARKED' type
        FiltersVerifier
            .withFilters({ selectedType: 'BOOKMARKED' })
            .withCurrentUser(generator.user({ bookmarkedInquiries: [ inquiry3.id ] }))
            .expectResult([
                { inquiry: inquiry3 },
            ]);
        FiltersVerifier
            .withFilters({ selectedType: 'BOOKMARKED' })
            .expectResult([
                { inquiry: inquiry1 },
                { inquiry: inquiry2 },
                { inquiry: inquiry3 },
            ]);
    });

    it('should calculate distance and sort inquires by it', () => {
        FiltersVerifier
            .withFilters({
                location: mapLocationToLocationOption(generator.location({ lat: 50.061692, lng: 19.937347 })),
            })
            .expectResult([
                { inquiry: inquiry3, distance: 0.8875155603972721 },
                { inquiry: inquiry1, distance: 1.0515800895703138 },
                { inquiry: inquiry2, distance: 1.16478475581362 },
            ]);
    });

});
