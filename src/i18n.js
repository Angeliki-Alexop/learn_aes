import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.js';
import el from './locales/el.js';

const resources = {
  en: { translation: en },
  el: { translation: el },
};

// Pick saved language from localStorage when available (safe check for window)
let savedLng = 'en';
if (typeof window !== 'undefined') {
  try {
    const s = localStorage.getItem('lng');
    if (s) savedLng = s;
  } catch (e) {
    // ignore localStorage errors
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLng,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
