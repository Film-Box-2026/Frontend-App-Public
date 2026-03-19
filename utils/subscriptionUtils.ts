import { MOVIE_LIMIT_CONFIG, UserSubscription } from '@/constants/subscriptionPlans';

/**
 * Kiểm tra có thể xem phim theo index hay không
 * @param movieIndex - Index phim (0-based)
 * @param subscription - User subscription
 * @returns { canWatch: boolean, remainingMovies: number }
 */
export const checkMovieAccessibility = (
  movieIndex: number,
  subscription: UserSubscription | null
): { canWatch: boolean; remainingMovies: number } => {
  if (!subscription) {
    return { canWatch: false, remainingMovies: 0 };
  }

  const limit = MOVIE_LIMIT_CONFIG[subscription.currentPlan];

  // Basic plan: không giới hạn
  if (limit === null) {
    return { canWatch: true, remainingMovies: -1 };
  }

  // Free plan: giới hạn số phim
  const canWatch = movieIndex < limit;
  const remainingMovies = Math.max(0, limit - movieIndex - 1);

  return { canWatch, remainingMovies };
};

/**
 * Lấy số phim tối đa có thể xem
 */
export const getMovieLimitByPlan = (planId: string): number | null => {
  const limit = MOVIE_LIMIT_CONFIG[planId as keyof typeof MOVIE_LIMIT_CONFIG];
  return limit ?? 0;
};

/**
 * Kiểm tra phim nào cần upgrade để xem
 */
export const filterMoviesBySubscription = (
  movies: any[],
  subscription: UserSubscription | null
): { accessible: any[]; restricted: any[] } => {
  if (!subscription) {
    return { accessible: [], restricted: movies };
  }

  const limit = MOVIE_LIMIT_CONFIG[subscription.currentPlan];

  if (limit === null) {
    // Basic: tất cả được xem
    return { accessible: movies, restricted: [] };
  }

  // Free: giới hạn
  return {
    accessible: movies.slice(0, limit),
    restricted: movies.slice(limit),
  };
};
