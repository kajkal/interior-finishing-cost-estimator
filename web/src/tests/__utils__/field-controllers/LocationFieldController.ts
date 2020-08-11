import userEvent from '@testing-library/user-event';
import { fireEvent, getAllByRole, screen } from '@testing-library/react';

import * as useLazyAutocompleteServiceModule from '../../../code/components/common/form-fields/location/useLazyAutocompleteService';
import { LocationOption } from '../../../code/components/common/form-fields/location/LocationField';
import { AbstractFieldController } from './AbstractFieldController';
import { Location } from '../../../graphql/generated-types';
import { flushPromises } from '../extendedUserEvent';


let mockGetPlacePredictions: jest.Mock;
let useLazyAutocompleteServiceSpy: jest.SpiedFunction<typeof useLazyAutocompleteServiceModule.useLazyAutocompleteService>;

beforeEach(() => {
    mockGetPlacePredictions?.mockRestore();
    mockGetPlacePredictions = jest.fn().mockImplementation((_request, callback) => {
        callback([]);
    });
    Object.defineProperty(mockGetPlacePredictions, 'cancel', { value: jest.fn() });

    useLazyAutocompleteServiceSpy?.mockRestore();
    useLazyAutocompleteServiceSpy = jest.spyOn(useLazyAutocompleteServiceModule, 'useLazyAutocompleteService');
    useLazyAutocompleteServiceSpy.mockReturnValue({ getPlacePredictions: mockGetPlacePredictions as any });
});

export class LocationFieldController extends AbstractFieldController {

    static from(inputElement: HTMLElement): LocationFieldController {
        return this.resolve(inputElement) as LocationFieldController;
    }

    clearLocation(): LocationFieldController {
        return this.then(async (inputElement: HTMLElement) => {
            userEvent.click(screen.getByTitle('t:form.common.tags.clear'));
            fireEvent.blur(inputElement);
            await flushPromises();
            return inputElement;
        }) as LocationFieldController;
    }

    selectLocation(location: Location): LocationFieldController {
        return this.then(async (inputElement: HTMLElement) => {

            mockGetPlacePredictions.mockImplementation((_request, callback) => {
                callback([ mapLocationToLocationOption(location) ]);
            });

            await userEvent.type(inputElement, location.main);

            const optionList = screen.getByRole('listbox');
            const options = getAllByRole(optionList, 'option');
            expect(options).toHaveLength(1);
            userEvent.click(options[ 0 ]);

            expect(inputElement).toHaveValue(`${location.main}, ${location.secondary}`);

            fireEvent.blur(inputElement);
            await flushPromises();
            return inputElement;
        }) as LocationFieldController;
    }


}

function mapLocationToLocationOption(location: Location) {
    return {
        place_id: location.placeId,
        description: location.main + ', ' + location.secondary,
        structured_formatting: {
            main_text: location.main,
            secondary_text: location.secondary,
            main_text_matched_substrings: [],
        },
    } as LocationOption;
}
