import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Series {
  id: string;
  title: string;
  description: string;
  rating: number;
}

interface SeriesState {
  series: Series[];
  selectedSeries: Series | null;
  favorites: Series[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SeriesState = {
  series: [],
  selectedSeries: null,
  favorites: [],
  isLoading: false,
  error: null,
};

const seriesSlice = createSlice({
  name: 'series',
  initialState,
  reducers: {
    setSeries: (state, action: PayloadAction<Series[]>) => {
      state.series = action.payload;
      state.isLoading = false;
    },
    selectSeries: (state, action: PayloadAction<Series>) => {
      state.selectedSeries = action.payload;
    },
    addToSeriesFavorites: (state, action: PayloadAction<Series>) => {
      if (!state.favorites.find((s) => s.id === action.payload.id)) {
        state.favorites.push(action.payload);
      }
    },
    removeFromSeriesFavorites: (state, action: PayloadAction<string>) => {
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
  setSeries,
  selectSeries,
  addToSeriesFavorites,
  removeFromSeriesFavorites,
  setLoading,
  setError,
} = seriesSlice.actions;
export default seriesSlice.reducer;
