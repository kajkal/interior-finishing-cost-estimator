import { act, renderHook } from '@testing-library/react-hooks';

import * as loadGoogleMapsScriptModule from '../../../code/utils/google-maps/loadGoogleMapsScript';


type GeocodePlace = (request: google.maps.GeocoderRequest) => Promise<google.maps.GeocoderResult[]>;

describe('useLazyGeocoder hook', () => {

    let simulateGoogleMapsScriptLoadSuccess: () => Promise<void>;
    let simulateGoogleMapsScriptLoadFailure: () => Promise<void>;
    let MockGeocoder: jest.Mock;

    // isolated hooks:
    let useLazyGeocoder: (initialLanguage?: string) => { geocodePlace: GeocodePlace };

    beforeEach(() => {
        jest.isolateModules(() => {
            ({ useLazyGeocoder } = require('../../../code/utils/google-maps/useLazyGeocoder'));
        });
        jest.spyOn(loadGoogleMapsScriptModule, 'loadGoogleMapsScript').mockReturnValue(
            new Promise((resolve) => {
                simulateGoogleMapsScriptLoadSuccess = () => act(async () => await resolve(true));
                simulateGoogleMapsScriptLoadFailure = () => act(async () => await resolve(false));
            }),
        );
        MockGeocoder = jest.fn().mockImplementation(() => ({}));
        window.google = { maps: { Geocoder: MockGeocoder } } as any;
    });

    describe('geocodePlace function', () => {

        it('should be placeholder function until google maps api script loads', async () => {
            const { result } = renderHook(useLazyGeocoder);
            expect(result.current.geocodePlace).toBeInstanceOf(Function);
            expect(MockGeocoder).toHaveBeenCalledTimes(0);

            await simulateGoogleMapsScriptLoadSuccess();

            expect(result.current.geocodePlace).toBeInstanceOf(Function);
            expect(MockGeocoder).toHaveBeenCalledTimes(1);
        });

        it('should permanently be placeholder function when google maps api script load failed', async () => {
            const { result } = renderHook(useLazyGeocoder);
            expect(result.current.geocodePlace).toBeInstanceOf(Function);
            expect(MockGeocoder).toHaveBeenCalledTimes(0);

            await simulateGoogleMapsScriptLoadFailure();

            expect(result.current.geocodePlace).toBeInstanceOf(Function);
            expect(MockGeocoder).toHaveBeenCalledTimes(0);
        });

        it('should resole with results from google maps api', async () => {
            const mockGeocode = jest.fn().mockImplementation((request, callback) => {
                switch (request.placeId) {
                    case 'with elements':
                        callback([ 1, 2, 3, 4, 5 ], '_status');
                        break;
                    case 'with error':
                        callback(null, '_status');
                        break;
                    default:
                        throw new Error();
                }
            });
            MockGeocoder.mockImplementation(() => ({
                geocode: mockGeocode,
            }));

            const { result } = renderHook(useLazyGeocoder);
            await simulateGoogleMapsScriptLoadSuccess();

            // verify when service return array of object
            expect(await result.current.geocodePlace({ placeId: 'with elements' })).toEqual([ 1, 2, 3, 4, 5 ]);

            // verify when service return null
            expect(await result.current.geocodePlace({ placeId: 'with error' })).toEqual([]);
        });

    });

});
