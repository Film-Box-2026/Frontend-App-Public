import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSystemColorScheme } from '@/store/slices/themeSlice';
import { useEffect } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export function useColorScheme(): 'light' | 'dark' | null {
  const systemColorScheme = useSystemColorScheme();
  const selectedScheme = useAppSelector((state) => state.theme.colorScheme);
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (systemColorScheme) {
      dispatch(setSystemColorScheme(systemColorScheme));
    }
  }, [systemColorScheme, dispatch]);

  if (selectedScheme === 'system') {
    return systemColorScheme ?? null;
  }
  return selectedScheme;
}
