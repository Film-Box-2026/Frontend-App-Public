import { saveComments } from '@/services/storage/storageService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    addMovieComment,
    addMovieCommentReply,
    getTotalCommentsCount,
    MovieComment,
    MovieCommentReply,
    removeMovieComment,
    removeMovieCommentReply,
} from '@/store/slices/CommentSlice/commentSlice';
import { useCallback } from 'react';

interface AddCommentParams {
  movieId: string;
  content: string;
}

interface DeleteCommentParams {
  movieId: string;
  commentId: string;
}

interface AddReplyParams {
  movieId: string;
  parentCommentId: string;
  content: string;
}

interface DeleteReplyParams {
  movieId: string;
  parentCommentId: string;
  replyId: string;
}

export const useMovieComments = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const commentsByMovieId = useAppSelector((state) => state.comment.itemsByMovieId);

  const getMovieComments = useCallback(
    (movieId: string): MovieComment[] => {
      return commentsByMovieId[movieId] || [];
    },
    [commentsByMovieId]
  );

  const addComment = useCallback(
    async ({ movieId, content }: AddCommentParams): Promise<boolean> => {
      if (!user) {
        return false;
      }

      const normalizedContent = content.trim();
      if (!normalizedContent) {
        return false;
      }

      const comment: MovieComment = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        movieId,
        userName: user.name,
        userEmail: user.email,
        content: normalizedContent,
        createdAt: new Date().toISOString(),
        replies: [],
      };

      dispatch(addMovieComment(comment));

      const currentMovieComments: MovieComment[] =
        commentsByMovieId[movieId] || [];
      const updatedComments = {
        ...commentsByMovieId,
        [movieId]: [comment, ...currentMovieComments].slice(0, 50),
      };
      await saveComments(updatedComments);

      return true;
    },
    [user, dispatch, commentsByMovieId]
  );

  const canDeleteComment = useCallback(
    (comment: MovieComment): boolean => {
      return !!user && comment.userEmail === user.email;
    },
    [user]
  );

  const canDeleteReply = useCallback(
    (reply: MovieCommentReply): boolean => {
      return !!user && reply.userEmail === user.email;
    },
    [user]
  );

  const deleteComment = useCallback(
    async ({ movieId, commentId }: DeleteCommentParams): Promise<boolean> => {
      if (!user) {
        return false;
      }

      const currentMovieComments: MovieComment[] =
        commentsByMovieId[movieId] || [];
      const comment = currentMovieComments.find((item) => item.id === commentId);

      if (!comment || comment.userEmail !== user.email) {
        return false;
      }

      dispatch(removeMovieComment({ movieId, commentId }));

      const updatedComments = {
        ...commentsByMovieId,
        [movieId]: currentMovieComments.filter((item) => item.id !== commentId),
      };
      await saveComments(updatedComments);

      return true;
    },
    [user, dispatch, commentsByMovieId]
  );

  const addReply = useCallback(
    async ({ movieId, parentCommentId, content }: AddReplyParams): Promise<boolean> => {
      if (!user) {
        return false;
      }

      const normalizedContent = content.trim();
      if (!normalizedContent) {
        return false;
      }

      const currentMovieComments: MovieComment[] = commentsByMovieId[movieId] || [];
      const parentComment = currentMovieComments.find((item) => item.id === parentCommentId);

      if (!parentComment) {
        return false;
      }

      const reply: MovieCommentReply = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        movieId,
        parentCommentId,
        userName: user.name,
        userEmail: user.email,
        content: normalizedContent,
        createdAt: new Date().toISOString(),
      };

      dispatch(addMovieCommentReply({ movieId, parentCommentId, reply }));

      const updatedComments = {
        ...commentsByMovieId,
        [movieId]: currentMovieComments.map((item) => {
          if (item.id !== parentCommentId) {
            return item;
          }

          return {
            ...item,
            replies: [...(item.replies || []), reply].slice(0, 50),
          };
        }),
      };

      await saveComments(updatedComments);
      return true;
    },
    [user, dispatch, commentsByMovieId]
  );

  const deleteReply = useCallback(
    async ({ movieId, parentCommentId, replyId }: DeleteReplyParams): Promise<boolean> => {
      if (!user) {
        return false;
      }

      const currentMovieComments: MovieComment[] = commentsByMovieId[movieId] || [];
      const parentComment = currentMovieComments.find((item) => item.id === parentCommentId);
      const reply = parentComment?.replies?.find((item) => item.id === replyId);

      if (!parentComment || !reply || reply.userEmail !== user.email) {
        return false;
      }

      dispatch(removeMovieCommentReply({ movieId, parentCommentId, replyId }));

      const updatedComments = {
        ...commentsByMovieId,
        [movieId]: currentMovieComments.map((item) => {
          if (item.id !== parentCommentId) {
            return item;
          }

          return {
            ...item,
            replies: (item.replies || []).filter((child) => child.id !== replyId),
          };
        }),
      };

      await saveComments(updatedComments);
      return true;
    },
    [user, dispatch, commentsByMovieId]
  );

  const getMovieCommentsCount = useCallback(
    (movieId: string): number => {
      return getTotalCommentsCount(commentsByMovieId[movieId] || []);
    },
    [commentsByMovieId]
  );

  return {
    getMovieComments,
    addComment,
    addReply,
    canDeleteComment,
    canDeleteReply,
    deleteComment,
    deleteReply,
    getMovieCommentsCount,
  };
};
