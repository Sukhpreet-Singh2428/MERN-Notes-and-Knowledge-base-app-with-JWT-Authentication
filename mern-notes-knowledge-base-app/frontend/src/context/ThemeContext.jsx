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

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('hearth_theme') || 'light';
    if (saved === 'dark') return true;
    if (saved === 'system') return window.matchMedia('(prefers-color-scheme: dark)').matches;
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem('hearth_theme', theme);

    const applyTheme = (dark) => {
      setIsDark(dark);
      if (dark) {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
      }
    };

    if (theme === 'dark') {
      applyTheme(true);
    } else if (theme === 'light') {
      applyTheme(false);
    } else if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);

      const handler = (e) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('hearth_editor_font', editorFont);
  }, [editorFont]);

  useEffect(() => {
    localStorage.setItem('hearth_default_color', defaultColor);
  }, [defaultColor]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: setThemeState,
        toggleTheme,
        isDark,
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

