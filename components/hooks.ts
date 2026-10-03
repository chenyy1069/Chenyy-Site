import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'chenyy-theme';
const PAPER: Record<Theme, string> = { light: '#f4f1e9', dark: '#20221d' };

const readStored = (): Theme | null => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
};

/**
 * Light/dark theme on <html data-theme>. index.html sets the initial value
 * before paint; until the visitor picks one, it follows the system setting.
 */
export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', PAPER[theme]);
  }, [theme]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const follow = (e: MediaQueryListEvent) => {
      if (!readStored()) setTheme(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', follow);
    return () => mq.removeEventListener('change', follow);
  }, []);

  const toggle = () =>
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Switching still works without storage; it just won't be remembered.
      }
      return next;
    });

  return { theme, toggle };
};
