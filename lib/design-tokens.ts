export type Theme = 'light' | 'dark';

export const tokens = {
  fonts: {
    display: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
  },
  colors: {
    light: {
      bg: '#FFFFFF',
      bgAlt: '#F9FAFB',
      bgTertiary: '#F3F4F6',
      text: '#111827',
      textSecondary: '#6B7280',
      textTertiary: '#9CA3AF',
      border: '#E5E7EB',
      primary: '#6366F1',
      primaryHover: '#4F46E5',
      primaryLight: '#EEF2FF',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      cardBg: '#FFFFFF',
      cardBorder: '#E5E7EB',
    },
    dark: {
      bg: '#0D1117',
      bgAlt: '#161B22',
      bgTertiary: '#21262D',
      text: '#C9D1D9',
      textSecondary: '#8B949E',
      textTertiary: '#6E7681',
      border: '#30363D',
      primary: '#818CF8',
      primaryHover: '#6366F1',
      primaryLight: '#312E81',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      cardBg: '#161B22',
      cardBorder: '#30363D',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  radii: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  sizes: {
    navHeight: '64px',
    sidebarWidth: '250px',
  },
} as const;

export type Colors = (typeof tokens.colors)['light'];
