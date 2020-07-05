import fs from 'fs';
import path from 'path';

import React from 'react';
import ReactDOM from 'react-dom';
import I18nReact from 'react-i18next';
import { render, screen, waitFor } from '@testing-library/react';
import i18n, { BackendModule, i18n as I18n, ReadCallback } from 'i18next';

import { MockServiceWorker } from '../__mocks__/other/serviceWorker';
import { supportedLanguages } from '../../code/config/supportedLanguages';


// unmock globally mocked library
jest.unmock('react-i18next');

jest.mock('../../code/components/providers/apollo/ApolloContextProvider', () => ({
    ApolloContextProvider: (props: any) => <>{props.children}</>,
}));
jest.mock('../../code/components/navigation/Routes', () => ({
    Routes: () => <div data-testid='MockRoutes' />,
}));
jest.mock('../../code/components/layout/Layout', () => ({
    Layout: (props: any) => <div data-testid='MockLayout'>{props.children}</div>,
}));

describe('index file', () => {

    let rootElement: HTMLDivElement;

    beforeEach(() => {
        rootElement = document.createElement('div');
        rootElement.id = 'root';
        document.body.appendChild(rootElement);

        MockServiceWorker.setupMocks();
    });

    afterEach(() => {
        ReactDOM.unmountComponentAtNode(rootElement);
        rootElement.remove();
    });

    describe('app structure', () => {

        it('should render app root inside root element', () => {
            jest.isolateModules(() => {
                require('../../index');
            });

            // verify if Layout and Routes are present in DOM
            expect(screen.getByTestId('MockLayout')).toBeInTheDocument();
            expect(screen.getByTestId('MockRoutes')).toBeInTheDocument();

            // verify if service worker was unregistered
            expect(MockServiceWorker.unregister).toHaveBeenCalledTimes(1);
            expect(MockServiceWorker.register).toHaveBeenCalledTimes(0);
        });

    });

    describe('i18n', () => {

        // isolated libraries:
        let i18n: I18n; // 'i18next'
        let i18nReact: typeof I18nReact; // 'react-i18next'

        // isolated components:
        let SampleChildComponent: React.FunctionComponent;

        function setupI18nContext<T>(fakeI18nBackend: BackendModule<T>) {
            jest.isolateModules(() => {
                i18n = require('i18next');
                i18nReact = require('react-i18next');

                // create i18 instance for testing purposes
                i18n.use(fakeI18nBackend).use(i18nReact.initReactI18next).init({ lng: 'dev' });

                // mute actual i18n instance creation
                jest.spyOn(i18n, 'use').mockReturnThis();
                jest.spyOn(i18n, 'init').mockResolvedValue(() => {
                });

                require('../../index');
            });

            // create sample child component with correct version of 'react-i18next' library
            SampleChildComponent = () => {
                const { t } = i18nReact.useTranslation();
                return <span data-testid='child-component'>{t('sample-translation-key')}</span>;
            };
        }

        it('should display spinner until i18n initialization is complete and then should use correct translations', async (done) => {
            jest.mock('../../code/config/supportedLanguages', () => ({
                supportedLanguages: [
                    { code: 'en', name: 'English' },
                    { code: 'pl', name: 'Polski' },
                    { code: 'it', name: 'italiano' },
                ],
            }));

            const fakeBackend: BackendModule<undefined> = {
                type: 'backend',
                init() {},
                read(language: string, namespace: string, callback: ReadCallback) {
                    callback(null, { 'sample-translation-key': 'Translated text' });
                },
                create() {},
            };

            setupI18nContext(fakeBackend);

            render(
                <React.Suspense fallback={<div data-testid='MockSpinner' />}>
                    <SampleChildComponent />
                </React.Suspense>,
            );

            // verify if loader/spinner/progressbar is visible
            expect(screen.getByTestId('MockSpinner')).toBeInTheDocument();

            // verify if i18n was initialized on component file import
            expect(i18n.use).toHaveBeenCalledTimes(3);
            expect(i18n.use).toHaveBeenNthCalledWith(1, expect.objectContaining({ type: 'backend' }));
            expect(i18n.use).toHaveBeenNthCalledWith(2, expect.objectContaining({ type: 'languageDetector' }));
            expect(i18n.use).toHaveBeenNthCalledWith(3, expect.objectContaining({ type: '3rdParty' }));
            expect(i18n.init).toHaveBeenCalledTimes(1);
            expect(i18n.init).toHaveBeenCalledWith(expect.objectContaining({
                detection: expect.objectContaining({
                    checkWhitelist: true,
                }),
                whitelist: [ 'en', 'pl', 'it' ], // all supported languages
            }));

            // wait for spinner to disappear (should disappear when the translation data is fetched by i18n module)
            await waitFor(() => expect(screen.queryByTestId('MockSpinner')).toBe(null));

            // verify if child component is visible and if it's translation is correct
            expect(screen.queryByTestId('child-component')).toHaveTextContent('Translated text');
            done();
        });

        /**
         * Maps each value from translation files to '-' and then compares translation file structures.
         */
        it(`should support: ${supportedLanguages.map(l => l.code).join(', ')} languages`, async (done) => {
            const rootDirectory = './public/locales';
            const localeDirectories = await fs.promises.readdir(rootDirectory);
            const locales = await Promise.all(localeDirectories.map(async (locale) => {
                const translationFilePath = path.resolve(rootDirectory, locale, 'translation.json');
                const translationFileContent = await fs.promises.readFile(translationFilePath, 'utf-8');
                const normalizedTranslationFileContent = JSON.parse(translationFileContent, (key, value) => (
                    typeof value === 'string' ? '-' : value
                ));
                return {
                    name: locale,
                    translation: normalizedTranslationFileContent,
                };
            }));

            const supportedLocaleNames = supportedLanguages.map(l => l.code);
            const localeNames = locales.map(l => l.name);

            // verify if all supported languages are really supported
            expect(localeNames.length).toBe(supportedLocaleNames.length);
            expect(localeNames).toEqual(expect.arrayContaining(localeNames));

            // verify if all translations contains correct structure
            locales.forEach(({ translation }) => {
                expect(translation).toEqual(locales[ 0 ].translation);
            });
            done();
        });

    });

});
