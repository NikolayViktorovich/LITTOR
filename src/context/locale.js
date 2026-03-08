import { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ru from '../i18n/locales/ru';
import en from '../i18n/locales/en';

const translations = {
  'Русский': ru,
  'English': en,
  'Español': en,
  'Deutsch': en,
  'Français': en,
  '中文': en,
  '日本語': en,
  'العربية': en,
};

export const LocaleContext = createContext();

export const LocaleProvider = ({ children }) => {
  const [locale, setLocale] = useState('Русский');
  const [t, setT] = useState(ru);

  useEffect(() => {
    loadLocale();
  }, []);

  const loadLocale = async () => {
    try {
      const saved = await AsyncStorage.getItem('language');
      if (saved && translations[saved]) {
        setLocale(saved);
        setT(translations[saved]);
      }
    } catch (error) {
      console.error('не загрузился язык:', error);
    }
  };

  const changeLocale = async (newLocale) => {
    try {
      setLocale(newLocale);
      setT(translations[newLocale] || ru);
      await AsyncStorage.setItem('language', newLocale);
    } catch (error) {
      console.error('не сохранился язык:', error);
    }
  };

  return (
    <LocaleContext.Provider value={{ locale, t, changeLocale }}>
      {children}
    </LocaleContext.Provider>
  );
};
