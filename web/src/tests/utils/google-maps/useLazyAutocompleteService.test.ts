import { act, renderHook } from '@testing-library/react-hooks';

import * as loadGoogleMapsScriptModule from '../../../code/utils/google-maps/loadGoogleMapsScript';


type GetPlacePredictions = (
    request: google.maps.places.AutocompletionRequest,
    callback: (results: google.maps.places.AutocompletePrediction[]) => void,
) => void;

describe('useLazyAutocompleteService hook', () => {

    let simulateGoogleMapsScriptLoadSuccess: () => Promise<void>;
    let simulateGoogleMapsScriptLoadFailure: () => Promise<void>;
    let MockAutocompleteService: jest.Mock;

    // isolated hooks:
    let useLazyAutocompleteService: (initialLanguage?: string) => { getPlacePredictions: GetPlacePredictions };

    beforeEach(() => {
        jest.isolateModules(() => {
            ({ useLazyAutocompleteService } = require('../../../code/utils/google-maps/useLazyAutocompleteService'));
        });
        jest.spyOn(loadGoogleMapsScriptModule, 'loadGoogleMapsScript').mockReturnValue(
            new Promise((resolve) => {
                simulateGoogleMapsScriptLoadSuccess = () => act(async () => await resolve(true));
                simulateGoogleMapsScriptLoadFailure = () => act(async () => await resolve(false));
            }),
        );
        MockAutocompleteService = jest.fn().mockImplementation(() => ({}));
        window.google = { maps: { places: { AutocompleteService: MockAutocompleteService } } } as any;
    });

    describe('getPlacePredictions function', () => {

        it('should be undefined until google maps api script loads', async () => {
            const { result } = renderHook(useLazyAutocompleteService);
            expect(result.current.getPlacePredictions).toBeUndefined();
            expect(MockAutocompleteService).toHaveBeenCalledTimes(0);

            await simulateGoogleMapsScriptLoadSuccess();

            expect(result.current.getPlacePredictions).toBeInstanceOf(Function);
            expect(MockAutocompleteService).toHaveBeenCalledTimes(1);
        });

        it('should permanently be undefined when google maps api script load failed', async () => {
            const { result } = renderHook(useLazyAutocompleteService);
            expect(result.current.getPlacePredictions).toBeUndefined();
            expect(MockAutocompleteService).toHaveBeenCalledTimes(0);

            await simulateGoogleMapsScriptLoadFailure();

            expect(result.current.getPlacePredictions).toBeUndefined();
            expect(MockAutocompleteService).toHaveBeenCalledTimes(0);
        });

        it('should call callback with results from google maps api', async () => {
            const now = Date.now();
            const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(now);

            const mockGetPlacePredictions = jest.fn();
            MockAutocompleteService.mockImplementation(() => ({
                getPlacePredictions: mockGetPlacePredictions,
            }));

            const { result } = renderHook(useLazyAutocompleteService);
            await simulateGoogleMapsScriptLoadSuccess();

            expect(result.current.getPlacePredictions).toBeInstanceOf(Function);
            const sampleRequest = { input: 'Test' };

            // verify when service return array of object
            mockGetPlacePredictions.mockImplementation((_request, callback) => {
                callback([ 1, 2, 3, 4, 5 ], '_status');
            });
            const callback1 = jest.fn();

            result.current.getPlacePredictions(sampleRequest, callback1);
            result.current.getPlacePredictions(sampleRequest, callback1);
            result.current.getPlacePredictions(sampleRequest, callback1); // calls should be throttled
            expect(callback1).toHaveBeenCalledTimes(1);
            expect(callback1).toHaveBeenCalledWith([ 1, 2, 3, 4, 5 ]);

            dateNowSpy.mockReturnValue(now + 200); // throttle is based on current Date.now()

            // verify when service return null
            mockGetPlacePredictions.mockClear().mockImplementation((_request, callback) => {
                callback(null, '_status');
            });
            const callback2 = jest.fn();

            result.current.getPlacePredictions(sampleRequest, callback2);
            expect(callback2).toHaveBeenCalledTimes(1);
            expect(callback2).toHaveBeenCalledWith([]);
        });

    });

});
