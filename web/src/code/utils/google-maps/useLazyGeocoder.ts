import React from 'react';
import { loadGoogleMapsScript } from './loadGoogleMapsScript';


let lazyGeocoder: google.maps.Geocoder | null = null;

function getGeocoder() {
    if (!lazyGeocoder) {
        lazyGeocoder = new window.google.maps.Geocoder();
    }
    return lazyGeocoder;
}


export async function geocodePlace(request: google.maps.GeocoderRequest): Promise<google.maps.GeocoderResult[]> {
    const ready = await loadGoogleMapsScript();
    const geocoder = ready && getGeocoder();
    return new Promise((resolve) => {
        if (geocoder) {
            geocoder.geocode(request, (results, _status) => {
                resolve(results || []);
            });
        } else {
            resolve([]);
        }
    });
}


export function useLazyGeocoder(initialLanguage?: string) {
    const [ service, setService ] = React.useState<google.maps.Geocoder | null>(null);

    React.useEffect(() => {
        let active = true;
        void async function initialize() {
            const ready = await loadGoogleMapsScript(initialLanguage);
            ready && active && setService(getGeocoder());
        }();
        return () => {
            active = false;
        };
    }, [ initialLanguage, setService ]);

    return { geocodePlace: React.useMemo(() => geocodePlace, [ service ]) };
}
