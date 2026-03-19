import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Movie {
  id: string;
  title: string;
  description: string;
  rating: number;
}

interface HomeState {
  movies: Movie[];
  selectedMovie: Movie | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: HomeState = {
  movies: [],
  selectedMovie: null,
  isLoading: false,
  error: null,
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    setMovies: (state, action: PayloadAction<Movie[]>) => {
      state.movies = action.payload;
      state.isLoading = false;
    },
    selectMovie: (state, action: PayloadAction<Movie>) => {
      state.selectedMovie = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setMovies, selectMovie, setLoading, setError } =
  homeSlice.actions;
export default homeSlice.reducer;
