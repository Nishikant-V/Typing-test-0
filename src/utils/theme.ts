export type Theme = 'dark' | 'light';

const THEME_KEY = 'typespeed:theme:v1';

export function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';

  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
  } catch {
    // localStorage might not be accessible
  }

  return 'dark';
}

export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;

  document.documentElement.setAttribute('data-theme', theme);

  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore quota/storage errors
  }
}
