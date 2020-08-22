import * as loadGoogleMapsScriptModule from '../../../code/utils/google-maps/loadGoogleMapsScript';


describe('lazyGeocoder', () => {

    let simulateGoogleMapsScriptLoadSuccess: () => void;
    let simulateGoogleMapsScriptLoadFailure: () => void;
    let MockGeocoder: jest.Mock;

    // isolated functions:
    let geocodePlace: (request: google.maps.GeocoderRequest) => Promise<google.maps.GeocoderResult[]>;

    beforeEach(() => {
        jest.isolateModules(() => {
            ({ geocodePlace } = require('../../../code/utils/google-maps/lazyGeocoder'));
        });
        jest.spyOn(loadGoogleMapsScriptModule, 'loadGoogleMapsScript').mockReturnValue(
            new Promise((resolve) => {
                simulateGoogleMapsScriptLoadSuccess = () => resolve(true);
                simulateGoogleMapsScriptLoadFailure = () => resolve(false);
            }),
        );
        MockGeocoder = jest.fn().mockImplementation(() => ({}));
        window.google = { maps: { Geocoder: MockGeocoder } } as any;
    });

    describe('geocodePlace function', () => {

        it('should wait for google maps api script to load', async () => {
            const mockGeocode = jest.fn().mockImplementation((request, callback) => {
                callback([ 1, 2, 3 ], '_status');
            });
            MockGeocoder.mockImplementation(() => ({ geocode: mockGeocode }));

            const promise = geocodePlace({ placeId: 'id' });
            expect(MockGeocoder).toHaveBeenCalledTimes(0);

            simulateGoogleMapsScriptLoadSuccess();

            expect(await promise).toEqual([ 1, 2, 3 ]);
            expect(MockGeocoder).toHaveBeenCalledTimes(1);
        });

        it('should resolve with empty array when google maps api script load failed', async () => {
            const promise = geocodePlace({ placeId: 'id' });
            expect(MockGeocoder).toHaveBeenCalledTimes(0);

            simulateGoogleMapsScriptLoadFailure();

            expect(await promise).toEqual([]);
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
            MockGeocoder.mockImplementation(() => ({ geocode: mockGeocode }));

            simulateGoogleMapsScriptLoadSuccess();

            // verify when service return array of object
            expect(await geocodePlace({ placeId: 'with elements' })).toEqual([ 1, 2, 3, 4, 5 ]);

            // verify when service return null
            expect(await geocodePlace({ placeId: 'with error' })).toEqual([]);
        });

    });

});
