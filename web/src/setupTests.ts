// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import './tests/__mocks__/libraries/react-i18next'; // mock i18n globally
import { Settings } from 'luxon';

// "TypeError: MutationObserver is not a constructor" fix:
window.MutationObserver = require('@sheerun/mutationobserver-shim');


Settings.defaultZoneName = 'utc';
