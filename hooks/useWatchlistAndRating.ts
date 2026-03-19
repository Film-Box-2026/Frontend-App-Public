import { saveRatings, saveWatchlist } from '@/services/storage/storageService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addOrUpdateRating, RatingItem } from '@/store/slices/RatingSlice/ratingSlice';
import { addToWatchlist, removeFromWatchlist, WatchlistItem } from '@/store/slices/WatchlistSlice/watchlistSlice';
import { useCallback } from 'react';

interface WatchlistMovieParams {
  movieId: string;
  slug: string;
  name: string;
  posterUrl: string;
}

interface RatingMovieParams {
  movieId: string;
  slug: string;
  rating: number;
  review?: string;
}

export const useWatchlistAndRating = () => {
  const dispatch = useAppDispatch();
  const watchlist = useAppSelector((state) => state.watchlist.items);
  const ratings = useAppSelector((state) => state.rating.items);

  const addToWatchlistHandler = useCallback(
    async (params: WatchlistMovieParams) => {
      const item: WatchlistItem = {
        ...params,
        addedAt: new Date().toISOString(),
      };

      dispatch(addToWatchlist(item));
      const updatedWatchlist = [...watchlist, item];
      await saveWatchlist(updatedWatchlist);
    },
    [watchlist, dispatch]
  );

  const removeFromWatchlistHandler = useCallback(
    async (movieId: string) => {
      dispatch(removeFromWatchlist(movieId));
      const updatedWatchlist = watchlist.filter((item) => item.movieId !== movieId);
      await saveWatchlist(updatedWatchlist);
    },
    [watchlist, dispatch]
  );

  const isInWatchlist = useCallback(
    (movieId: string): boolean => {
      return watchlist.some((item) => item.movieId === movieId);
    },
    [watchlist]
  );

  const rateMovie = useCallback(
    async (params: RatingMovieParams) => {
      const item: RatingItem = {
        ...params,
        ratedAt: new Date().toISOString(),
      };

      dispatch(addOrUpdateRating(item));

      const existingIndex = ratings.findIndex((r) => r.movieId === params.movieId);
      let updatedRatings: RatingItem[];

      if (existingIndex >= 0) {
        updatedRatings = [...ratings];
        updatedRatings[existingIndex] = item;
      } else {
        updatedRatings = [...ratings, item];
      }

      await saveRatings(updatedRatings);
    },
    [ratings, dispatch]
  );

  const getMovieRating = useCallback(
    (movieId: string): RatingItem | undefined => {
      return ratings.find((r) => r.movieId === movieId);
    },
    [ratings]
  );

  return {
    addToWatchlistHandler,
    removeFromWatchlistHandler,
    isInWatchlist,
    rateMovie,
    getMovieRating,
  };
};
