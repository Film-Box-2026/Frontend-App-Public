import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface RatingItem {
  movieId: string;
  slug: string;
  rating: number; 
  review?: string;
  ratedAt: string;
}

interface RatingState {
  items: RatingItem[];
}

const initialState: RatingState = {
  items: [],
};

const ratingSlice = createSlice({
  name: 'rating',
  initialState,
  reducers: {
    addOrUpdateRating: (state, action: PayloadAction<RatingItem>) => {
      const index = state.items.findIndex((item) => item.movieId === action.payload.movieId);
      if (index >= 0) {
        state.items[index] = action.payload;
      } else {
        state.items.push(action.payload);
      }
    },
    removeRating: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.movieId !== action.payload);
    },
    setRatings: (state, action: PayloadAction<RatingItem[]>) => {
      state.items = action.payload;
    },
  },
});

export const { addOrUpdateRating, removeRating, setRatings } = ratingSlice.actions;
export default ratingSlice.reducer;
