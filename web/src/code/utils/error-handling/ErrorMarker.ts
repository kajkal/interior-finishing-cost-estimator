export class ErrorMarker {

    static markAsHandledError<T extends Error>(error: T) {
        Object.defineProperty(error, 'handled', { value: true });
    }

    static isUnhandledError<T extends Error>(error?: T | null): boolean {
        return Boolean(error && !error.hasOwnProperty('handled'));
    }

}
