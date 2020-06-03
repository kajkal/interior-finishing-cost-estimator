import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { supportedLanguages } from '../../../config/supportedLanguages';


/**
 * Initialize i18n, I18nProvider will display spinner until translations are fetched.
 */
i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        backend: {
            loadPath: '/locales/{{lng}}/{{ns}}.json',
        },
        detection: {
            lookupLocalStorage: 'language',
            checkWhitelist: true,
        },
        // fallbackLng: 'en', // fallback language is always loaded, regardless of selected language
        fallbackLng: false, // only selected language is loaded
        debug: true,
        interpolation: {
            escapeValue: false,
        },
        whitelist: supportedLanguages.map(({ code }) => code),
    });
