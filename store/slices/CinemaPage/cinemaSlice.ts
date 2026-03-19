import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CinemaMovie {
  id: string;
  title: string;
  description: string;
  rating: number;
}

interface CinemaState {
  movies: CinemaMovie[];
  selectedMovie: CinemaMovie | null;
  favorites: CinemaMovie[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CinemaState = {
  movies: [],
  selectedMovie: null,
  favorites: [],
  isLoading: false,
  error: null,
};

const cinemaSlice = createSlice({
  name: 'cinema',
  initialState,
  reducers: {
    setCinemaMovies: (state, action: PayloadAction<CinemaMovie[]>) => {
      state.movies = action.payload;
      state.isLoading = false;
    },
    selectCinemaMovie: (state, action: PayloadAction<CinemaMovie>) => {
      state.selectedMovie = action.payload;
    },
    addToCinemaFavorites: (state, action: PayloadAction<CinemaMovie>) => {
      if (!state.favorites.find((m) => m.id === action.payload.id)) {
        state.favorites.push(action.payload);
      }
    },
    removeFromCinemaFavorites: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter((m) => m.id !== action.payload);
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
  setCinemaMovies,
  selectCinemaMovie,
  addToCinemaFavorites,
  removeFromCinemaFavorites,
  setLoading,
  setError,
} = cinemaSlice.actions;
export default cinemaSlice.reducer;
