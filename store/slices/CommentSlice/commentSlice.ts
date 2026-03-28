import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MovieComment {
  id: string;
  movieId: string;
  parentCommentId: string | null; // thread gốc
  replyToCommentId: string | null; // direct reply target
  userName: string;
  userEmail: string;
  content: string;
  createdAt: string;
}

export interface MovieCommentReply extends MovieComment {} // alias for compatibility

export interface CommentsState {
  itemsByMovieId: Record<string, MovieComment[]>;
}

const initialState: CommentsState = {
  itemsByMovieId: {},
};

const normalizeCommentsByMovieId = (
  commentsByMovieId: Record<string, MovieComment[]>
): Record<string, MovieComment[]> => {
  const normalized: Record<string, MovieComment[]> = {};

  Object.entries(commentsByMovieId || {}).forEach(([movieId, comments]) => {
    normalized[movieId] = (comments || []).map((comment) => ({
      ...comment,
      parentCommentId: comment.parentCommentId || null,
      replyToCommentId: comment.replyToCommentId || null,
    }));
  });

  return normalized;
};

export const getTotalCommentsCount = (comments: MovieComment[]): number => {
  return comments.filter((c) => !c.parentCommentId).length;
};

const commentSlice = createSlice({
  name: 'comment',
  initialState,
  reducers: {
    addMovieComment: (state, action: PayloadAction<MovieComment>) => {
      const comment = {
        ...action.payload,
        parentCommentId: null,
        replyToCommentId: null,
      };
      const movieComments = state.itemsByMovieId[comment.movieId] || [];
      state.itemsByMovieId[comment.movieId] = [comment, ...movieComments].slice(0, 50);
    },
    setComments: (state, action: PayloadAction<Record<string, MovieComment[]>>) => {
      state.itemsByMovieId = normalizeCommentsByMovieId(action.payload);
    },
    removeMovieComment: (
      state,
      action: PayloadAction<{ movieId: string; commentId: string }>
    ) => {
      const { movieId, commentId } = action.payload;
      const movieComments = state.itemsByMovieId[movieId] || [];
      state.itemsByMovieId[movieId] = movieComments.filter(
        (comment) => comment.id !== commentId && comment.parentCommentId !== commentId
      );
    },
    addMovieCommentReply: (
      state,
      action: PayloadAction<MovieComment>
    ) => {
      const reply = action.payload;
      const movieComments = state.itemsByMovieId[reply.movieId] || [];
      state.itemsByMovieId[reply.movieId] = [reply, ...movieComments].slice(0, 50);
    },
    removeMovieCommentReply: (
      state,
      action: PayloadAction<{ movieId: string; replyId: string }>
    ) => {
      const { movieId, replyId } = action.payload;
      const movieComments = state.itemsByMovieId[movieId] || [];
      state.itemsByMovieId[movieId] = movieComments.filter(
        (comment) => comment.id !== replyId
      );
    },
    clearComments: (state) => {
      state.itemsByMovieId = {};
    },
  },
});

export const {
  addMovieComment,
  setComments,
  removeMovieComment,
  addMovieCommentReply,
  removeMovieCommentReply,
  clearComments,
} = commentSlice.actions;
export default commentSlice.reducer;
