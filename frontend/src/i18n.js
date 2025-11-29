import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpApi) 
  .use(LanguageDetector) 
  .use(initReactI18next)
  .init({
    supportedLngs: ['fr', 'en'],
  
    fallbackLng: 'fr', 

    debug: false,
    
    detection: {
      
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    
    react: {
      useSuspense: false // Évite les erreurs de chargement blanc
    }
  });

export default i18n;