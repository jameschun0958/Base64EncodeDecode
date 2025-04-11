import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en';
import esTranslation from './locales/es';
import frTranslation from './locales/fr';
import zhTWTranslation from './locales/zh-TW';
import jaTranslation from './locales/ja';
import koTranslation from './locales/ko';

const resources = {
  en: enTranslation,
  es: esTranslation,
  fr: frTranslation,
  'zh-TW': zhTWTranslation,
  ja: jaTranslation,
  ko: koTranslation
};

// Function to create a consistent i18n instance
const createI18nInstance = () => {
  // For server-side rendering, always use English initially
  const isServer = typeof window === 'undefined';
  
  return i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      lng: 'en', // Always start with English for consistent SSR
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false, // React already safes from XSS
      },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
      // Disable suspense mode for server-side rendering
      react: {
        useSuspense: !isServer
      }
    });
};

// Initialize i18n
createI18nInstance();

export default i18n;