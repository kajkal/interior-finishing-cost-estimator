import { LocationOption } from '../../components/common/form-fields/location/LocationField';
import { Location, LocationFormData } from '../../../graphql/generated-types';
import { geocodePlace } from '../google-maps/lazyGeocoder';


export function mapLocationToLocationOption<T extends Location | null>(location: T): T extends Location ? LocationOption : null {
    const mapped: LocationOption | null = location && {
        place_id: location.placeId,
        description: location.main + ', ' + location.secondary,
        structured_formatting: {
            main_text: location.main,
            secondary_text: location.secondary,
            main_text_matched_substrings: [],
        },
        latLng: (location.lat && location.lng) ? {
            lat: location.lat,
            lng: location.lng,
        } : null,
    };
    return mapped as any;
}

export async function mapLocationOptionToLocationFormData<T extends LocationOption | null>(locationOption: T): Promise<T extends LocationOption ? LocationFormData : null> {
    const mapped: LocationFormData | null = locationOption && {
        placeId: locationOption.place_id,
        main: locationOption.structured_formatting.main_text,
        secondary: locationOption.structured_formatting.secondary_text,
        ...(await getLocationLatLng(locationOption!)),
    };
    return mapped as any;
}

export async function getLocationLatLng(location: LocationOption): Promise<google.maps.LatLngLiteral> {
    if (location.latLng) {
        return location.latLng;
    }
    const [ placeDetails ] = await geocodePlace({ placeId: location.place_id });
    return {
        lat: placeDetails?.geometry.location.lat() || -1,
        lng: placeDetails?.geometry.location.lng() || -1,
    };
}
