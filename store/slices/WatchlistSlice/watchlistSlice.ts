import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WatchlistItem {
  movieId: string;
  slug: string;
  name: string;
  posterUrl: string;
  addedAt: string;
}

interface WatchlistState {
  items: WatchlistItem[];
}

const initialState: WatchlistState = {
  items: [],
};

const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState,
  reducers: {
    addToWatchlist: (state, action: PayloadAction<WatchlistItem>) => {
      const exists = state.items.find((item) => item.movieId === action.payload.movieId);
      if (!exists) {
        state.items.push(action.payload);
      }
    },
    removeFromWatchlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.movieId !== action.payload);
    },
    setWatchlist: (state, action: PayloadAction<WatchlistItem[]>) => {
      state.items = action.payload;
    },
  },
});

export const { addToWatchlist, removeFromWatchlist, setWatchlist } = watchlistSlice.actions;
export default watchlistSlice.reducer;
