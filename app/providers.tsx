'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { type Theme } from '@/lib/design-tokens';

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('atlas_theme') as Theme | null;
    const resolved: Theme = stored === 'dark' ? 'dark' : 'light';
    setTheme(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('atlas_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  return context ?? { theme: 'light' as Theme, toggleTheme: () => {} };
}
