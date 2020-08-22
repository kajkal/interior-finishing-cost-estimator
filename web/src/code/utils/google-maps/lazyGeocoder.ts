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
