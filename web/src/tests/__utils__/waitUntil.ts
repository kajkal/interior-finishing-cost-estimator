export interface WaitUntilOptions {
    timeout: number;
    interval: number;
}

const defaultOptions = {
    timeout: 1000,
    interval: 50,
};

/**
 * Waits until test passes.
 * After given timeout throws error.
 */
export function waitUntil<T>(callback: () => T, options?: WaitUntilOptions): Promise<T> {
    return new Promise<T>(async (resolve, reject) => {
        const timeoutId = window.setTimeout(handleTimeout, options?.timeout || defaultOptions.timeout);
        const intervalId = window.setInterval(performTest, options?.interval || defaultOptions.interval);
        let lastError: any;

        function performTest() {
            try {
                handleResult(undefined, callback());
            } catch (error) {
                lastError = error;
            }
        }

        function handleTimeout() {
            handleResult(lastError || new Error('waitUntil timeout'), undefined);
        }

        function handleResult(error: any, result: T | undefined) {
            clearTimeout(timeoutId);
            clearInterval(intervalId);

            if (error) {
                reject(error);
            }
            resolve(result);
        }
    });
}
