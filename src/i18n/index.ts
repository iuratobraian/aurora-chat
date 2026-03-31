import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import es from './es.json';
import en from './en.json';
import pt from './pt.json';

const savedLanguage = typeof window !== 'undefined' 
  ? localStorage.getItem('tradehub_language') || 'es'
  : 'es';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
      pt: { translation: pt },
    },
    lng: savedLanguage,
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
  });

export const changeLanguage = (lang: 'es' | 'en' | 'pt') => {
  i18n.changeLanguage(lang);
  localStorage.setItem('tradehub_language', lang);
};

export const getCurrentLanguage = () => i18n.language as 'es' | 'en' | 'pt';

export const languages = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
];

export default i18n;
