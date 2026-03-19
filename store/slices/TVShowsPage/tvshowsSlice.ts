import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TVShow {
  id: string;
  title: string;
  description: string;
  rating: number;
}

interface TVShowsState {
  shows: TVShow[];
  selectedShow: TVShow | null;
  favorites: TVShow[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TVShowsState = {
  shows: [],
  selectedShow: null,
  favorites: [],
  isLoading: false,
  error: null,
};

const tvshowsSlice = createSlice({
  name: 'tvshows',
  initialState,
  reducers: {
    setTVShows: (state, action: PayloadAction<TVShow[]>) => {
      state.shows = action.payload;
      state.isLoading = false;
    },
    selectTVShow: (state, action: PayloadAction<TVShow>) => {
      state.selectedShow = action.payload;
    },
    addToTVShowsFavorites: (state, action: PayloadAction<TVShow>) => {
      if (!state.favorites.find((s) => s.id === action.payload.id)) {
        state.favorites.push(action.payload);
      }
    },
    removeFromTVShowsFavorites: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter((s) => s.id !== action.payload);
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
  setTVShows,
  selectTVShow,
  addToTVShowsFavorites,
  removeFromTVShowsFavorites,
  setLoading,
  setError,
} = tvshowsSlice.actions;
export default tvshowsSlice.reducer;
