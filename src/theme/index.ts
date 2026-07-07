import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';
import { COLORS, LIGHT_THEME, DARK_THEME } from './colors';

export const appDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: DARK_THEME.blue,
    secondary: DARK_THEME.blueDeep ?? COLORS.gradientEnd,
    background: DARK_THEME.background,
    surface: DARK_THEME.surface ?? '#071932',
    surfaceVariant: DARK_THEME.surfaceAlt ?? '#0E2648',
    onSurface: DARK_THEME.textPrimary,
    onBackground: DARK_THEME.textPrimary,
    outline: DARK_THEME.border ?? COLORS.borderMedium,
  },
};

export const appLightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: LIGHT_THEME.blue,
    secondary: LIGHT_THEME.blueDeep ?? '#F06A00',
    background: LIGHT_THEME.background,
    surface: LIGHT_THEME.surface ?? '#FFFFFF',
    surfaceVariant: LIGHT_THEME.backgroundAlt ?? '#E7EEFF',
    onSurface: LIGHT_THEME.textPrimary,
    onBackground: LIGHT_THEME.textPrimary,
    outline: LIGHT_THEME.border ?? '#D7E2FF',
  },
};
