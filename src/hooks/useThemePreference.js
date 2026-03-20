import { useEffect, useState } from 'react';

export default function useThemePreference(themeKey) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(themeKey);
    setTheme(savedTheme === 'dark' ? 'dark' : 'light');
  }, [themeKey]);

  useEffect(() => {
    document.body.dataset.theme = theme;
    window.localStorage.setItem(themeKey, theme);
  }, [themeKey, theme]);

  return [theme, setTheme];
}
