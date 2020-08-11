import React from 'react';
import throttle from 'lodash/throttle';


function loadScript(src: string, id: string) {
    return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.setAttribute('async', '');
        script.setAttribute('id', id);
        script.src = src;

        document.head.appendChild(script);
        script.addEventListener('load', (_event) => {
            resolve();
        });
        script.addEventListener('error', (error) => {
            reject(error);
        });
    });
}

let loadingPromise: Promise<google.maps.places.AutocompleteService> | null = null;

function loadAutocompleteService() {
    if (!loadingPromise) {
        loadingPromise = loadScript(process.env.REACT_APP_GOOGLE_MAPS_API, 'google-maps')
            .then(() => new window.google.maps.places.AutocompleteService());
    }
    return loadingPromise;
}

export function useLazyAutocompleteService(delay = 200) {
    const [ service, setService ] = React.useState<google.maps.places.AutocompleteService | null>(null);

    React.useEffect(() => {
        let active = true;
        void async function initializeService() {
            try {
                const service = await loadAutocompleteService();
                if (active) {
                    setService(service);
                }
            } catch (error) {
                console.error('cannot load googleapis script', error);
            }
        }();
        return () => {
            active = false;
        };
    }, [ setService ]);

    const getPlacePredictions = React.useMemo(() => {
        if (service) {
            return throttle((request: google.maps.places.AutocompletionRequest, callback: (results: google.maps.places.AutocompletePrediction[]) => void) => {
                service.getPlacePredictions(request, (result, _status) => {
                    callback(result || []);
                });
            }, delay);
        }
    }, [ service, delay ]);

    return { getPlacePredictions };
}
