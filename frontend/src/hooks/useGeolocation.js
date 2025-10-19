import { useEffect, useState } from 'react';
import axios from 'axios';

export const useGeolocation = () => {
  const [country, setCountry] = useState('US');
  const [countryCode, setCountryCode] = useState('+1');
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const detectLocation = async () => {
      try {
        const response = await axios.get('https://ipapi.co/json/');
        if (response.data) {
          setCountry(response.data.country_name || 'US');
          setCountryCode(response.data.country_calling_code || '+1');
          
          const langMap = {
            'TR': 'tr',
            'US': 'en',
            'GB': 'en'
          };
          setLanguage(langMap[response.data.country_code] || 'en');
        }
      } catch (error) {
        console.error('Geolocation detection failed:', error);
      }
    };

    detectLocation();
  }, []);

  return { country, countryCode, language };
};