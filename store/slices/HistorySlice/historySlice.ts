import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface HistoryItem {
  movieId: string;
  slug: string;
  name: string;
  posterUrl: string;
  watchedAt: string;
  duration: number; // seconds watched in this session
}

interface HistoryState {
  items: HistoryItem[];
}

const initialState: HistoryState = {
  items: [],
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addToHistory: (state, action: PayloadAction<HistoryItem>) => {
      state.items = state.items.filter((item) => item.movieId !== action.payload.movieId);
      state.items.unshift(action.payload);
      if (state.items.length > 50) {
        state.items = state.items.slice(0, 50);
      }
    },
    clearHistory: (state) => {
      state.items = [];
    },
    setHistory: (state, action: PayloadAction<HistoryItem[]>) => {
      state.items = action.payload;
    },
  },
});

export const { addToHistory, clearHistory, setHistory } = historySlice.actions;
export default historySlice.reducer;
