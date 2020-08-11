import { fireEvent } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';

import { muteConsole } from '../../../../__utils__/muteConsole';


type GetPlacePredictions = (
    request: google.maps.places.AutocompletionRequest,
    callback: (results: google.maps.places.AutocompletePrediction[]) => void,
) => void;

describe('useLazyAutocompleteService hook', () => {

    // isolated hooks:
    let useLazyAutocompleteService: (delay: number) => { getPlacePredictions: GetPlacePredictions };

    beforeEach(() => {
        document.head.querySelectorAll('*').forEach(n => n.remove());
        jest.isolateModules(() => {
            ({ useLazyAutocompleteService } = require('../../../../../code/components/common/form-fields/location/useLazyAutocompleteService'));
        });
    });

    const consoleErrorMock = muteConsole('error', (message) => (
        message.startsWith('cannot load googleapis script')
    ));

    it('should load googleapis script only once', async () => {
        const MockAutocompleteService = jest.fn().mockImplementation(() => ({}));
        window.google = { maps: { places: { AutocompleteService: MockAutocompleteService } } } as any;

        // verify if script tag is added lazily
        expect(document.head).toBeEmptyDOMElement();

        // trigger hook multiple times
        renderHook(useLazyAutocompleteService);
        renderHook(useLazyAutocompleteService);
        const { result } = renderHook(useLazyAutocompleteService);

        // verify if script tag was added only once
        expect(document.head.children).toHaveLength(1);

        // verify script tag
        const scriptElement = document.head.children[ 0 ];
        expect(scriptElement).toBeInstanceOf(HTMLScriptElement);
        expect(scriptElement).toHaveAttribute('async', '');

        // verify hook result
        expect(result.current.getPlacePredictions).toBeUndefined();

        // verify if AutocompleteService was not created
        expect(MockAutocompleteService).toHaveBeenCalledTimes(0);

        // simulate script load event
        await act(async () => {
            await fireEvent.load(scriptElement);
        })

        // verify if service was created and hook returned valid getPlacePredictions function
        expect(MockAutocompleteService).toHaveBeenCalledTimes(1);
        expect(result.current.getPlacePredictions).toBeInstanceOf(Function);
    });

    it('should log error in case of problems with script', async () => {
        const { result } = renderHook(useLazyAutocompleteService);

        const scriptElement = document.head.children[ 0 ];
        expect(scriptElement).toBeInstanceOf(HTMLScriptElement);

        // simulate script load error event
        await act(async () => {
            await fireEvent.error(scriptElement);
        });

        // verify if error was logged
        expect(consoleErrorMock).toHaveBeenCalledTimes(1);
        expect(consoleErrorMock).toHaveBeenCalledWith('cannot load googleapis script', expect.any(Object));

        expect(result.current.getPlacePredictions).toBeUndefined();
    });

    it('should call callback with results from google maps api', async () => {
        const now = Date.now();
        const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(now);
        const delay = 100;

        const mockGetPlacePredictions = jest.fn();
        const MockAutocompleteService = jest.fn().mockImplementation(() => ({
            getPlacePredictions: mockGetPlacePredictions,
        }));
        window.google = { maps: { places: { AutocompleteService: MockAutocompleteService } } } as any;

        const { result } = renderHook(useLazyAutocompleteService, { initialProps: delay });
        await act(async () => {
            await fireEvent.load(document.head.children[ 0 ]);
        });

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

        dateNowSpy.mockReturnValue(now + delay); // throttle is based on current Date.now()

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
