import { LocationOption } from '../../components/common/form-fields/location/LocationField';
import { Location, LocationFormData } from '../../../graphql/generated-types';
import { geocodePlace } from '../google-maps/useLazyGeocoder';


export function mapLocationToLocationOption<T extends Location | null>(location: T): T extends Location ? LocationOption : null {
    const mapped: LocationOption | null = location && {
        place_id: location.placeId,
        description: location.main + ', ' + location.secondary,
        structured_formatting: {
            main_text: location.main,
            secondary_text: location.secondary,
            main_text_matched_substrings: [],
        },
        lat: location.lat || undefined,
        lng: location.lng || undefined,
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

async function getLocationLatLng(location: LocationOption): Promise<{ lat?: number; lng?: number; }> {
    if (location.lat && location.lng) {
        return {
            lat: location.lat,
            lng: location.lng,
        };
    }
    const [ placeDetails ] = await geocodePlace({ placeId: location.place_id });
    return {
        lat: placeDetails?.geometry.location.lat(),
        lng: placeDetails?.geometry.location.lng(),
    };
}
