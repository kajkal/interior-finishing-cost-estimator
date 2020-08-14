let loadingPromise: Promise<boolean> | null = null;

export function loadGoogleMapsScript(language?: string) {
    if (!loadingPromise) {
        const librariesQuery = '&libraries=geometry,places';
        const languageQuery = language ? `&language=${language}` : '';
        const scriptSrc = process.env.REACT_APP_GOOGLE_MAPS_API + librariesQuery + languageQuery;

        loadingPromise = new Promise((resolve) => {
            const script = document.createElement('script');
            script.setAttribute('async', '');
            script.setAttribute('id', 'google-maps');
            script.src = scriptSrc;

            document.head.appendChild(script);
            script.addEventListener('load', (_event) => {
                resolve(true);
            });
            script.addEventListener('error', (error) => {
                console.error('cannot load googleapis script', error);
                resolve(false);
            });
        });
    }
    return loadingPromise;
}
