import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';

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

  const changeLanguage = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    localStorage.setItem('app_language', newLanguage);
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
