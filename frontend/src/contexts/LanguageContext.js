import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import i18n from '../i18n/config';
import api from '../utils/api';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children, user }) => {
  const { language: geoLanguage, country: geoCountry } = useGeolocation();
  
  // Priority: user.language > localStorage > geolocation > default 'en'
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    if (user?.language) return user.language;
    const stored = localStorage.getItem('app_language');
    if (stored) return stored;
    return geoLanguage || 'en';
  });

  const [currentCountry, setCurrentCountry] = useState(() => {
    if (user?.country) return user.country;
    const stored = localStorage.getItem('app_country');
    if (stored) return stored;
    return geoCountry || 'US';
  });

  // Load translations when language changes
  useEffect(() => {
    loadTranslations(currentLanguage);
  }, [currentLanguage]);

  // Update when user changes
  useEffect(() => {
    if (user?.language) {
      setCurrentLanguage(user.language);
      localStorage.setItem('app_language', user.language);
    }
    if (user?.country) {
      setCurrentCountry(user.country);
      localStorage.setItem('app_country', user.country);
    }
  }, [user]);

  const loadTranslations = async (lang) => {
    try {
      const response = await api.getSiteTranslations(lang);
      const translations = response.data.translations || {};
      
      // Add translations to i18next
      i18n.addResourceBundle(lang, 'translation', translations, true, true);
      
      // Change language in i18next
      await i18n.changeLanguage(lang);
      
      console.log(`✅ Translations loaded for ${lang}:`, Object.keys(translations).length, 'keys');
    } catch (error) {
      console.error(`Failed to load translations for ${lang}:`, error);
      // Fallback to English if translation loading fails
      if (lang !== 'en') {
        await i18n.changeLanguage('en');
      }
    }
  };

  const changeLanguage = async (newLanguage) => {
    setCurrentLanguage(newLanguage);
    localStorage.setItem('app_language', newLanguage);
    await loadTranslations(newLanguage);
  };

  const changeCountry = (newCountry) => {
    setCurrentCountry(newCountry);
    localStorage.setItem('app_country', newCountry);
  };

  return (
    <LanguageContext.Provider
      value={{
        language: currentLanguage,
        country: currentCountry,
        changeLanguage,
        changeCountry
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
