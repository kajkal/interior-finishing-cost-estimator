import React from 'react';
import throttle from 'lodash/throttle';
import { loadGoogleMapsScript } from './loadGoogleMapsScript';


let lazyAutocompleteService: google.maps.places.AutocompleteService | null = null;

function getAutocompleteService() {
    if (!lazyAutocompleteService) {
        lazyAutocompleteService = new window.google.maps.places.AutocompleteService();
    }
    return lazyAutocompleteService;
}


export function useLazyAutocompleteService(initialLanguage?: string) {
    const [ service, setService ] = React.useState<google.maps.places.AutocompleteService | null>(null);

    React.useEffect(() => {
        let active = true;
        void async function initialize() {
            const ready = await loadGoogleMapsScript(initialLanguage);
            ready && active && setService(getAutocompleteService());
        }();
        return () => {
            active = false;
        };
    }, [ initialLanguage, setService ]);

    const getPlacePredictions = React.useMemo(() => {
        if (service) {
            return throttle((request: google.maps.places.AutocompletionRequest, callback: (results: google.maps.places.AutocompletePrediction[]) => void) => {
                service.getPlacePredictions(request, (result, _status) => {
                    callback(result || []);
                });
            }, 200);
        }
    }, [ service ]);

    return { getPlacePredictions };
}
