import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#FF6B9D';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    headerBackground: '#FFFFFF',
    headerBorder: 'rgba(0,0,0,0.08)',
    tabBarBackground: '#101216',
    tabBarBorder: 'rgba(0,0,0,0.12)',
  },
  dark: {
    text: '#ECEDEE',
    background: '#16171fff',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    headerBackground: '#0B0B0E',
    headerBorder: 'rgba(255,255,255,0.08)',
    tabBarBackground: '#101216',
    tabBarBorder: 'rgba(255,255,255,0.08)',
  },
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
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
