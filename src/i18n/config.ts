import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './en.json';
import mr from './mr.json';

//
i18n
    .use(LanguageDetector) // Automatically detects language from browser/local storage
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            mr: { translation: mr }
        },
        fallbackLng: 'en', //
        debug: false,
        interpolation: {
            escapeValue: false, // React already safes from xss
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'], // Persists the language choice
        }
    });

export default i18n;