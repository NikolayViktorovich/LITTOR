import { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../theme/colors';

export const ThemeContext = createContext();

const accentColors = {
  purple: '#8B5CF6',
  blue: '#3B82F6',
  green: '#10B981',
  red: '#EF4444',
  orange: '#F97316',
  pink: '#EC4899',
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
  const [themeMode, setThemeMode] = useState('auto');
  const [accentColor, setAccentColor] = useState('purple');

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    if (themeMode === 'auto') setIsDark(systemColorScheme === 'dark');
  }, [systemColorScheme, themeMode]);

  const loadThemePreference = async () => {
    try {
      const [savedMode, savedAccent] = await AsyncStorage.multiGet(['themeMode', 'accent_color']);
      
      if (savedMode[1]) {
        setThemeMode(savedMode[1]);
        if (savedMode[1] === 'dark') setIsDark(true);
        if (savedMode[1] === 'light') setIsDark(false);
      }
      
      if (savedAccent[1]) {
        setAccentColor(savedAccent[1]);
      }
    } catch (error) {
      console.error('не загрузилась тема:', error);
    }
  };

  const toggleTheme = async (mode) => {
    setThemeMode(mode);
    await AsyncStorage.setItem('themeMode', mode);
    
    if (mode === 'dark') setIsDark(true);
    if (mode === 'light') setIsDark(false);
    if (mode === 'auto') setIsDark(systemColorScheme === 'dark');
  };

  const updateAccentColor = async (color) => {
    setAccentColor(color);
    await AsyncStorage.setItem('accent_color', color);
  };

  const baseTheme = isDark ? darkTheme : lightTheme;
  const theme = {
    ...baseTheme,
    primary: accentColors[accentColor] || accentColors.purple,
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, themeMode, toggleTheme, accentColor, updateAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
};
