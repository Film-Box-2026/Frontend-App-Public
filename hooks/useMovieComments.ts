import { saveComments } from '@/services/storage/storageService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    addMovieComment,
    addMovieCommentReply,
    getTotalCommentsCount,
    MovieComment,
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
  replyToCommentId: string;
  content: string;
}

interface DeleteReplyParams {
  movieId: string;
  replyId: string;
}

export const useMovieComments = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const commentsByMovieId = useAppSelector((state) => state.comment.itemsByMovieId);

  const getMovieComments = useCallback(
    (movieId: string): MovieComment[] => {
      const allComments = commentsByMovieId[movieId] || [];
      return allComments.filter((c) => !c.parentCommentId);
    },
    [commentsByMovieId]
  );

  const getCommentThread = useCallback(
    (movieId: string, rootCommentId: string): MovieComment[] => {
      const allComments = commentsByMovieId[movieId] || [];
      return allComments.filter(
        (c) => c.id === rootCommentId || c.parentCommentId === rootCommentId
      );
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
        parentCommentId: null,
        replyToCommentId: null,
        userName: user.name,
        userEmail: user.email,
        content: normalizedContent,
        createdAt: new Date().toISOString(),
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
    (reply: MovieComment): boolean => {
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
        [movieId]: currentMovieComments.filter(
          (item) => item.id !== commentId && item.parentCommentId !== commentId
        ),
      };
      await saveComments(updatedComments);

      return true;
    },
    [user, dispatch, commentsByMovieId]
  );

  const addReply = useCallback(
    async ({ movieId, replyToCommentId, content }: AddReplyParams): Promise<boolean> => {
      if (!user) {
        return false;
      }

      const normalizedContent = content.trim();
      if (!normalizedContent) {
        return false;
      }

      const currentMovieComments: MovieComment[] = commentsByMovieId[movieId] || [];
      const targetComment = currentMovieComments.find(
        (item) => item.id === replyToCommentId
      );

      if (!targetComment) {
        return false;
      }

      const parentCommentId = targetComment.parentCommentId || targetComment.id;

      const reply: MovieComment = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        movieId,
        parentCommentId,
        replyToCommentId,
        userName: user.name,
        userEmail: user.email,
        content: normalizedContent,
        createdAt: new Date().toISOString(),
      };

      dispatch(addMovieCommentReply(reply));

      const updatedComments = {
        ...commentsByMovieId,
        [movieId]: [reply, ...currentMovieComments].slice(0, 50),
      };

      await saveComments(updatedComments);
      return true;
    },
    [user, dispatch, commentsByMovieId]
  );

  const deleteReply = useCallback(
    async ({ movieId, replyId }: DeleteReplyParams): Promise<boolean> => {
      if (!user) {
        return false;
      }

      const currentMovieComments: MovieComment[] = commentsByMovieId[movieId] || [];
      const reply = currentMovieComments.find((item) => item.id === replyId);

      if (!reply || reply.userEmail !== user.email) {
        return false;
      }

      dispatch(removeMovieCommentReply({ movieId, replyId }));

      const updatedComments = {
        ...commentsByMovieId,
        [movieId]: currentMovieComments.filter((item) => item.id !== replyId),
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
    getCommentThread,
    addComment,
    addReply,
    canDeleteComment,
    canDeleteReply,
    deleteComment,
    deleteReply,
    getMovieCommentsCount,
  };
};
