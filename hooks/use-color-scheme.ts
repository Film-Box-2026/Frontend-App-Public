import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSystemColorScheme } from '@/store/slices/themeSlice';
import { useEffect } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export function useColorScheme() {
  const systemColorScheme = useSystemColorScheme();
  const selectedScheme = useAppSelector((state) => state.theme.colorScheme);
  const dispatch = useAppDispatch();

  // Cập nhật system color scheme vào Redux khi thay đổi
  useEffect(() => {
    if (systemColorScheme) {
      dispatch(setSystemColorScheme(systemColorScheme));
    }
  }, [systemColorScheme, dispatch]);

  if (selectedScheme === 'system') {
    return systemColorScheme;
  }
  return selectedScheme;
}
