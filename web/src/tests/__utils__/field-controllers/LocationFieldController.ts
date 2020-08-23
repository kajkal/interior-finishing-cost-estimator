import userEvent from '@testing-library/user-event';
import { fireEvent, getAllByRole, getByTitle, screen } from '@testing-library/react';

import * as useLazyAutocompleteServiceModule from '../../../code/utils/google-maps/useLazyAutocompleteService';
import * as useLazyGeocoderModule from '../../../code/utils/google-maps/lazyGeocoder';
import { mapLocationToLocationOption } from '../../../code/utils/mappers/locationMapper';
import { AbstractFieldController } from './AbstractFieldController';
import { Location } from '../../../graphql/generated-types';
import { flushPromises } from '../extendedUserEvent';


let mockGetPlacePredictions: jest.Mock;
let useLazyAutocompleteServiceSpy: jest.SpiedFunction<typeof useLazyAutocompleteServiceModule.useLazyAutocompleteService>;
let mockGeocodePlace: jest.SpiedFunction<typeof useLazyGeocoderModule.geocodePlace>;

beforeEach(() => {
    mockGetPlacePredictions?.mockRestore();
    mockGetPlacePredictions = jest.fn().mockImplementation((_request, callback) => {
        callback([]);
    });
    Object.defineProperty(mockGetPlacePredictions, 'cancel', { value: jest.fn() });

    useLazyAutocompleteServiceSpy?.mockRestore();
    useLazyAutocompleteServiceSpy = jest.spyOn(useLazyAutocompleteServiceModule, 'useLazyAutocompleteService');
    useLazyAutocompleteServiceSpy.mockReturnValue({ getPlacePredictions: mockGetPlacePredictions as any });

    mockGeocodePlace?.mockRestore();
    mockGeocodePlace = jest.spyOn(useLazyGeocoderModule, 'geocodePlace');
    mockGeocodePlace.mockResolvedValue([]);
});

export class LocationFieldController extends AbstractFieldController {

    static from(inputElement: HTMLElement): LocationFieldController {
        return this.resolve(inputElement) as LocationFieldController;
    }

    clearLocation(): LocationFieldController {
        return this.then(async (inputElement: HTMLElement) => {
            userEvent.click(getByTitle(inputElement.parentElement!, 't:form.common.clear'));
            fireEvent.blur(inputElement);
            await flushPromises();
            return inputElement;
        }) as LocationFieldController;
    }

    selectLocation(location?: Location | null): LocationFieldController {
        return this.then(async (inputElement: HTMLElement) => {
            if (location) {
                mockGetPlacePredictions.mockImplementation((_request, callback) => {
                    callback([ mapLocationToLocationOption(location) ]);
                });
                mockGeocodePlace.mockImplementation(async ({ placeId }) => {
                    if (placeId === location.placeId) {
                        return [ {
                            geometry: {
                                location: {
                                    lat: () => location.lat,
                                    lng: () => location.lng,
                                },
                            },
                        } ] as google.maps.GeocoderResult[];
                    }
                    return [];
                });

                await userEvent.type(inputElement, location.main);

                const optionList = screen.getByRole('listbox');
                const options = getAllByRole(optionList, 'option');
                expect(options).toHaveLength(1);
                userEvent.click(options[ 0 ]);

                expect(inputElement).toHaveValue(`${location.main}, ${location.secondary}`);
            }
            fireEvent.blur(inputElement);
            await flushPromises();
            return inputElement;
        }) as LocationFieldController;
    }


}
