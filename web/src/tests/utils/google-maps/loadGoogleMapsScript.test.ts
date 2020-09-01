import { fireEvent } from '@testing-library/react';

import { muteConsole } from '../../__utils__/mocks/muteConsole';


describe('loadGoogleMapsScript function', () => {

    // isolated functions:
    let loadGoogleMapsScript: (language?: string) => Promise<HTMLScriptElement>;

    const consoleErrorMock = muteConsole('error', (message) => (
        message.startsWith('cannot load googleapis script')
    ));

    beforeEach(() => {
        document.head.querySelectorAll('*').forEach(n => n.remove());
        jest.isolateModules(() => {
            ({ loadGoogleMapsScript } = require('../../../code/utils/google-maps/loadGoogleMapsScript'));
        });
    });

    it('should resolve with true on script load success', async () => {
        // verify if script tag is empty
        expect(document.head).toBeEmptyDOMElement();

        // trigger functions multiple times
        const promise1 = loadGoogleMapsScript('en'); // only initial language count
        const promise2 = loadGoogleMapsScript('en');
        const promise3 = loadGoogleMapsScript('pl');

        // verify if the same promise was returned
        expect(promise2).toBe(promise1);
        expect(promise3).toBe(promise1);

        // verify if script tag was added only once
        expect(document.head.children).toHaveLength(1);

        // verify script tag
        const scriptElement = document.head.children[ 0 ];
        expect(scriptElement).toBeInstanceOf(HTMLScriptElement);
        expect(scriptElement).toHaveAttribute('src', expect.stringMatching(/^.*&libraries=geometry,places&language=en$/));
        expect(scriptElement).toHaveAttribute('async', '');

        // simulate script load event
        fireEvent.load(scriptElement);

        // verify resolved value
        expect(await promise1).toBe(true);
    });

    it('should resolve with false on script loading error', async () => {
        const promise = loadGoogleMapsScript('en');
        const scriptElement = document.head.children[ 0 ];
        expect(scriptElement).toBeInstanceOf(HTMLScriptElement);

        // simulate script load error event
        fireEvent.error(scriptElement);

        // verify resolved value
        expect(await promise).toBe(false);

        // verify if error was logged
        expect(consoleErrorMock).toHaveBeenCalledTimes(1);
        expect(consoleErrorMock).toHaveBeenCalledWith('cannot load googleapis script', expect.any(Object));

    });

});
