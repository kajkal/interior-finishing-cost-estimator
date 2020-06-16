import fs from 'fs';
import path from 'path';
import React from 'react';
import I18nReact from 'react-i18next';
import { render, waitFor } from '@testing-library/react';
import { BackendModule, i18n as I18n, ReadCallback } from 'i18next';


// unmock globally mocked library
jest.unmock('react-i18next');

describe('I18nContextProvider component', () => {

    // isolated libraries:
    let i18n: I18n; // 'i18next'
    let i18nReact: typeof I18nReact; // 'react-i18next'

    // isolated components:
    let I18nContextProvider: React.FunctionComponent;
    let SampleChildComponent: React.FunctionComponent;

    function setupI18nContextProviderRenderingContext<T>(fakeI18nBackend: BackendModule<T>) {
        jest.isolateModules(() => {
            i18n = require('i18next');
            i18nReact = require('react-i18next');

            // create i18 instance for testing purposes
            i18n.use(fakeI18nBackend).use(i18nReact.initReactI18next).init({ lng: 'dev' });

            // mute actual i18n instance creation
            jest.spyOn(i18n, 'use').mockReturnThis();
            jest.spyOn(i18n, 'init').mockResolvedValue(() => {});

            I18nContextProvider = require('../../../../../code/components/providers/i18n/I18nContextProvider').I18nContextProvider;
        });

        // create sample child component with correct version of 'react-i18next' library
        SampleChildComponent = () => {
            const { t } = i18nReact.useTranslation();
            return <span data-testid='child-component'>{t('sample-translation-key')}</span>;
        };
    }

    it('should display spinner until i18n initialization is complete and then should render its children', async (done) => {
        const fakeBackend: BackendModule<undefined> = {
            type: 'backend',
            init() {},
            read(language: string, namespace: string, callback: ReadCallback) {
                callback(null, { 'sample-translation-key': 'Translated text' });
            },
            create() {},
        };

        setupI18nContextProviderRenderingContext(fakeBackend);

        const { queryByRole, queryByTestId } = render(
            <I18nContextProvider>
                <SampleChildComponent />
            </I18nContextProvider>,
        );

        // verify if loader/spinner/progressbar is visible
        expect(queryByRole('progressbar', { hidden: true })).toBeInTheDocument();

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
            whitelist: [ 'en', 'pl' ],
        }));

        // wait for spinner to disappear (should disappear when the translation data is fetched by i18n module)
        await waitFor(() => expect(queryByRole('progressbar', { hidden: true })).toBe(null));

        // verify if child component is visible and if it's translation is correct
        expect(queryByTestId('child-component')).toHaveTextContent('Translated text');
        done();
    });

    /**
     * Maps each value from translation files to '-' and then compares translation file structures.
     */
    it('should contain translation files with the same keys', async (done) => {
        const rootDirectory = './public/locales';
        const localeDirectories = await fs.promises.readdir(rootDirectory)
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

        const localeNames = locales.map(l => l.name);
        expect(localeNames).toEqual(expect.arrayContaining([ 'en', 'pl' ]));
        locales.forEach(({ translation }) => {
            expect(translation).toEqual(locales[0].translation);
        });
        done();
    });

});
