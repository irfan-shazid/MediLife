import { Platform } from 'react-native';

// MediTime design tokens — calm, minimal, one confident accent per state.
export const Colors = {
  light: {
    text: '#16221C',
    textSecondary: '#5B6B63',
    textMuted: '#94A29B',
    background: '#F7FBF9',
    card: '#FFFFFF',
    cardSelected: '#EAF6F0',
    border: '#E3EDE8',
    primary: '#2F9E75',
    primaryMuted: '#E1F3EA',
    accent: '#F2A65A',
    accentMuted: '#FCEBD9',
    success: '#2F9E75',
    danger: '#E0645A',
    dangerMuted: '#FBE7E5',
    warning: '#F2A65A',
    tabBarBackground: '#FFFFFF',
    tabIconDefault: '#A7B3AD',
    tabIconSelected: '#2F9E75',
  },
  dark: {
    text: '#EAF3EE',
    textSecondary: '#A9B8B0',
    textMuted: '#6F7D76',
    background: '#0F1613',
    card: '#182420',
    cardSelected: '#20342B',
    border: '#233029',
    primary: '#4CC99A',
    primaryMuted: '#1B3229',
    accent: '#F2B679',
    accentMuted: '#3A2E1E',
    success: '#4CC99A',
    danger: '#E88880',
    dangerMuted: '#3A2320',
    warning: '#F2B679',
    tabBarBackground: '#141F1B',
    tabIconDefault: '#5C6B63',
    tabIconSelected: '#4CC99A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'Inter, ui-sans-serif, system-ui, sans-serif',
    rounded: 'ui-rounded, "SF Pro Rounded", system-ui, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const FontSize = {
  caption: 13,
  body: 16,
  bodyLarge: 18,
  title: 22,
  heading: 28,
  display: 34,
} as const;
