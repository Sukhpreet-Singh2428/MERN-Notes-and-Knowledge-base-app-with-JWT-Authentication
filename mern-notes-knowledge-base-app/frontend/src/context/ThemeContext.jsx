import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('hearth_theme') || 'light';
  });

  const [editorFont, setEditorFont] = useState(() => {
    return localStorage.getItem('hearth_editor_font') || 'dm-sans';
  });

  const [defaultColor, setDefaultColor] = useState(() => {
    return localStorage.getItem('hearth_default_color') || 'default';
  });

  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem('hearth_theme', theme);

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('hearth_editor_font', editorFont);
  }, [editorFont]);

  useEffect(() => {
    localStorage.setItem('hearth_default_color', defaultColor);
  }, [defaultColor]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: setThemeState,
        toggleTheme,
        editorFont,
        setEditorFont,
        defaultColor,
        setDefaultColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
