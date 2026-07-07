import { useMemo } from 'react';
import { appDarkTheme, appLightTheme } from '../theme';
import { useAppStore } from '../store/useAppStore';

export const useThemeMode = () => {
  const darkMode = useAppStore((state) => state.profile.darkMode);

  return useMemo(() => {
    return darkMode ? appDarkTheme : appLightTheme;
  }, [darkMode]);
};
