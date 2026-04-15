import { Platform } from 'react-native';

// Legacy light/dark tokens — kept for backward compat with useThemeColor hook
const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// ─── Chartis design system ────────────────────────────────────────────────────

export const DARK = {
  bg: '#0d0f14',
  card: '#13151c',
  cardAlt: '#1a1d26',
  border: '#1e2130',
  borderLight: '#252a38',

  gold: '#C9A84C',
  goldDim: '#C9A84C22',
  goldText: '#D4B86A',

  text: '#FFFFFF',
  textSecondary: '#8A8FA3',
  textMuted: '#4B5264',

  correct: '#22C55E',
  correctDim: '#22C55E1A',
  incorrect: '#EF4444',
  incorrectDim: '#EF44441A',

  tabBar: '#0d0f14',
  tabBorder: '#1e2130',
};

export const CFA_BRAND = {
  primary: '#002C5F',
  secondary: '#0078A8',
  gold: '#C9A84C',
};

export const CFAColors = {
  correct: { light: '#16A34A', dark: '#22C55E' },
  incorrect: { light: '#DC2626', dark: '#EF4444' },
  selected: { light: '#2563EB', dark: '#3B82F6' },
  unanswered: { light: '#E5E7EB', dark: '#374151' },
  hint: { light: '#FEF3C7', dark: '#92400E' },

  topic: {
    'Ethics': '#7C3AED',
    'Quantitative Methods': '#0369A1',
    'Economics': '#0D9488',
    'Financial Reporting & Analysis': '#B45309',
    'Corporate Issuers': '#6D28D9',
    'Equity Investments': '#15803D',
    'Fixed Income': '#1D4ED8',
    'Derivatives': '#9D174D',
    'Alternative Investments': '#92400E',
    'Portfolio Management': '#1E40AF',
  } as Record<string, string>,

  difficulty: {
    1: '#16A34A',
    2: '#D97706',
    3: '#DC2626',
  } as Record<number, string>,

  streakFire: '#F97316',
  streakFireDim: '#FED7AA',

  cardSurface: { light: '#F9FAFB', dark: '#1F2937' },
  cardBorder: { light: '#E5E7EB', dark: '#374151' },
  divider: { light: '#F3F4F6', dark: '#111827' },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
