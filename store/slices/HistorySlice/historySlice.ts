import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface HistoryItem {
  movieId: string;
  slug: string;
  name: string;
  posterUrl: string;
  watchedAt: string;
  duration: number;
  lastServerIndex?: number;
  lastEpisodeIndex?: number;
  lastEpisodeSlug?: string;
}

interface HistoryState {
  items: HistoryItem[];
}

const getHistoryIdentity = (item: HistoryItem): string => {
  if (item.lastEpisodeSlug) {
    return `${item.movieId}:${item.lastEpisodeSlug}`;
  }

  if (
    typeof item.lastServerIndex === 'number' &&
    typeof item.lastEpisodeIndex === 'number'
  ) {
    return `${item.movieId}:${item.lastServerIndex}:${item.lastEpisodeIndex}`;
  }

  return item.movieId;
};

const initialState: HistoryState = {
  items: [],
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addToHistory: (state, action: PayloadAction<HistoryItem>) => {
      const targetIdentity = getHistoryIdentity(action.payload);
      state.items = state.items.filter(
        (item) => getHistoryIdentity(item) !== targetIdentity
      );
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
