import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MovieCommentReply {
  id: string;
  movieId: string;
  parentCommentId: string;
  userName: string;
  userEmail: string;
  content: string;
  createdAt: string;
}

export interface MovieComment {
  id: string;
  movieId: string;
  userName: string;
  userEmail: string;
  content: string;
  createdAt: string;
  replies: MovieCommentReply[];
}

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
      replies: comment.replies || [],
    }));
  });

  return normalized;
};

export const getTotalCommentsCount = (comments: MovieComment[]): number => {
  return comments.reduce(
    (total, comment) => total + 1 + (comment.replies?.length || 0),
    0
  );
};

const commentSlice = createSlice({
  name: 'comment',
  initialState,
  reducers: {
    addMovieComment: (state, action: PayloadAction<MovieComment>) => {
      const comment = {
        ...action.payload,
        replies: action.payload.replies || [],
      };
      const movieComments = state.itemsByMovieId[comment.movieId] || [];
      state.itemsByMovieId[comment.movieId] = [comment, ...movieComments].slice(
        0,
        50
      );
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
        (comment) => comment.id !== commentId
      );
    },
    addMovieCommentReply: (
      state,
      action: PayloadAction<{ movieId: string; parentCommentId: string; reply: MovieCommentReply }>
    ) => {
      const { movieId, parentCommentId, reply } = action.payload;
      const movieComments = state.itemsByMovieId[movieId] || [];

      state.itemsByMovieId[movieId] = movieComments.map((comment) => {
        if (comment.id !== parentCommentId) {
          return comment;
        }

        return {
          ...comment,
          replies: [...(comment.replies || []), reply].slice(0, 50),
        };
      });
    },
    removeMovieCommentReply: (
      state,
      action: PayloadAction<{ movieId: string; parentCommentId: string; replyId: string }>
    ) => {
      const { movieId, parentCommentId, replyId } = action.payload;
      const movieComments = state.itemsByMovieId[movieId] || [];

      state.itemsByMovieId[movieId] = movieComments.map((comment) => {
        if (comment.id !== parentCommentId) {
          return comment;
        }

        return {
          ...comment,
          replies: (comment.replies || []).filter((reply) => reply.id !== replyId),
        };
      });
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
