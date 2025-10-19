import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import axios from 'axios';

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Backend plugin to load translations from API
const backendPlugin = {
  type: 'backend',
  init: function() {},
  read: function(language, namespace, callback) {
    axios.get(`${API_BASE}/translations/${language}`)
      .then((response) => {
        const translations = response.data.translations || {};
        callback(null, translations);
      })
      .catch((error) => {
        console.error(`Failed to load translations for ${language}:`, error);
        // Return empty object on error
        callback(null, {});
      });
  }
};

i18n
  .use(backendPlugin)
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    backend: {
      loadPath: `${API_BASE}/translations/{{lng}}`
    }
  });

export default i18n;