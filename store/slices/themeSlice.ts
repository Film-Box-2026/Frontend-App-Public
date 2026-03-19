import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ColorScheme = 'light' | 'dark' | 'system';

interface ThemeState {
  colorScheme: ColorScheme;
  systemColorScheme: 'light' | 'dark' | null;
}

const initialState: ThemeState = {
  colorScheme: 'dark',
  systemColorScheme: null,
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setColorScheme: (state, action: PayloadAction<ColorScheme>) => {
      state.colorScheme = action.payload;
    },
    setSystemColorScheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.systemColorScheme = action.payload;
    },
    toggleTheme: (state) => {
      if (state.colorScheme === 'light') {
        state.colorScheme = 'dark';
      } else if (state.colorScheme === 'dark') {
        state.colorScheme = 'light';
      } else {
        const currentSystemScheme = state.systemColorScheme || 'light';
        state.colorScheme = currentSystemScheme === 'light' ? 'dark' : 'light';
      }
    },
  },
});

export const { setColorScheme, setSystemColorScheme, toggleTheme } =
  themeSlice.actions;
export default themeSlice.reducer;
