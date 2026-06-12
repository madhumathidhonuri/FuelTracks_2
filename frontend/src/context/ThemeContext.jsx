import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ft_theme') || 'light';
    }
    return 'light';
  });

  const isDark = theme === 'dark';

  useEffect(() => {
    const stored = localStorage.getItem('ft_theme');
    if (stored) {
      setTheme(stored);
      document.documentElement.setAttribute('data-theme', stored);
      if (stored === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    }
  }, []);

  useEffect(() => {
    if (theme) {
      localStorage.setItem('ft_theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    }
  }, [theme]);

  const toggle = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const mapTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const mapAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <ThemeContext.Provider value={{ theme, toggle, isDark, mapTileUrl, mapAttribution }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};