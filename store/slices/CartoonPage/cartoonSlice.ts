import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Cartoon {
  id: string;
  title: string;
  description: string;
  rating: number;
}

interface CartoonState {
  cartoons: Cartoon[];
  selectedCartoon: Cartoon | null;
  favorites: Cartoon[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CartoonState = {
  cartoons: [],
  selectedCartoon: null,
  favorites: [],
  isLoading: false,
  error: null,
};

const cartoonSlice = createSlice({
  name: 'cartoon',
  initialState,
  reducers: {
    setCartoons: (state, action: PayloadAction<Cartoon[]>) => {
      state.cartoons = action.payload;
      state.isLoading = false;
    },
    selectCartoon: (state, action: PayloadAction<Cartoon>) => {
      state.selectedCartoon = action.payload;
    },
    addToCartoonFavorites: (state, action: PayloadAction<Cartoon>) => {
      if (!state.favorites.find((c) => c.id === action.payload.id)) {
        state.favorites.push(action.payload);
      }
    },
    removeFromCartoonFavorites: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter((c) => c.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCartoons,
  selectCartoon,
  addToCartoonFavorites,
  removeFromCartoonFavorites,
  setLoading,
  setError,
} = cartoonSlice.actions;
export default cartoonSlice.reducer;
