import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '../constants/theme.js';
import { useGlobal } from './GlobalContext';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme(); 
  
  const { userProfile, updateUserProfile } = useGlobal();
  const preferences = userProfile?.preferences || {};

  const getThemeMode = () => {
    if (preferences.theme) return preferences.theme;
    return 'system';
  };

  const themeMode = getThemeMode();
  const [theme, setTheme] = useState(lightTheme);

  useEffect(() => {
    let activeMode = themeMode;
    
    if (themeMode === 'system') {
      activeMode = systemScheme;
    }

    setTheme(activeMode === 'dark' ? darkTheme : lightTheme);
  }, [themeMode, systemScheme]);

  // 4. Actualizar el tema guarda directamente en el GlobalContext (y por ende en BBDD/Storage)
  const toggleTheme = (newMode) => {
    updateUserProfile({
      preferences: {
        ...preferences,
        theme: newMode,
        // Sincronizamos el booleano también para que tu switch de settings funcione
        darkMode: newMode === 'dark'
      }
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);