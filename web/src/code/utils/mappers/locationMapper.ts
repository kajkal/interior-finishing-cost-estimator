import { LocationOption } from '../../components/common/form-fields/location/LocationField';
import { Location, LocationFormData } from '../../../graphql/generated-types';


export function mapLocationToLocationOption<T extends Location | null>(location: T): T extends Location ? LocationOption : null {
    const mapped: LocationOption | null = location && {
        place_id: location.placeId,
        description: location.main + ', ' + location.secondary,
        structured_formatting: {
            main_text: location.main,
            secondary_text: location.secondary,
            main_text_matched_substrings: [],
        },
    };
    return mapped as any;
}

export function mapLocationOptionToLocationFormData<T extends LocationOption | null>(locationOption: T): T extends LocationOption ? LocationFormData : null {
    const mapped: LocationFormData | null = locationOption && {
        placeId: locationOption.place_id,
        main: locationOption.structured_formatting.main_text,
        secondary: locationOption.structured_formatting.secondary_text,
    };
    return mapped as any;
}
