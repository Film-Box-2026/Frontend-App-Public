import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MovieComment {
  id: string;
  movieId: string;
  userName: string;
  userEmail: string;
  content: string;
  createdAt: string;
}

export interface CommentsState {
  itemsByMovieId: Record<string, MovieComment[]>;
}

const initialState: CommentsState = {
  itemsByMovieId: {},
};

const commentSlice = createSlice({
  name: 'comment',
  initialState,
  reducers: {
    addMovieComment: (state, action: PayloadAction<MovieComment>) => {
      const comment = action.payload;
      const movieComments = state.itemsByMovieId[comment.movieId] || [];
      state.itemsByMovieId[comment.movieId] = [comment, ...movieComments].slice(
        0,
        50
      );
    },
    setComments: (state, action: PayloadAction<Record<string, MovieComment[]>>) => {
      state.itemsByMovieId = action.payload;
    },
    removeMovieComment: (
      state,
      action: PayloadAction<{ movieId: string; commentId: string }>
    ) => {
      const { movieId, commentId } = action.payload;
      const movieComments = state.itemsByMovieId[movieId] || [];
      state.itemsByMovieId[movieId] = movieComments.filter(
        (comment) => comment.id !== commentId
      );
    },
    clearComments: (state) => {
      state.itemsByMovieId = {};
    },
  },
});

export const { addMovieComment, setComments, removeMovieComment, clearComments } =
  commentSlice.actions;
export default commentSlice.reducer;
