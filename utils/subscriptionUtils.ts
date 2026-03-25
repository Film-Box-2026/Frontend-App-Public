import { MOVIE_LIMIT_CONFIG, UserSubscription } from '@/constants/subscriptionPlans';


export const checkMovieAccessibility = (
  watchedEpisodeCount: number,
  subscription: UserSubscription | null
): { canWatch: boolean; remainingMovies: number } => {
  if (!subscription) {
    return { canWatch: false, remainingMovies: 0 };
  }

  const limit = MOVIE_LIMIT_CONFIG[subscription.currentPlan];

  // Premium plan (hoặc dữ liệu legacy): không giới hạn
  if (limit === null) {
    return { canWatch: true, remainingMovies: -1 };
  }

  if (typeof limit !== 'number') {
    return { canWatch: true, remainingMovies: -1 };
  }

  // Free plan: giới hạn số tập đã xem
  const canWatch = watchedEpisodeCount < limit;
  const remainingMovies = Math.max(0, limit - watchedEpisodeCount - 1);

  return { canWatch, remainingMovies };
};


export const getMovieLimitByPlan = (planId: string): number | null => {
  const limit = MOVIE_LIMIT_CONFIG[planId as keyof typeof MOVIE_LIMIT_CONFIG];
  return limit ?? 0;
};


export const filterMoviesBySubscription = (
  movies: any[],
  subscription: UserSubscription | null
): { accessible: any[]; restricted: any[] } => {
  if (!subscription) {
    return { accessible: [], restricted: movies };
  }

  const limit = MOVIE_LIMIT_CONFIG[subscription.currentPlan];

  if (limit === null) {
    // Premium: tất cả được xem
    return { accessible: movies, restricted: [] };
  }

  if (typeof limit !== 'number') {
    return { accessible: movies, restricted: [] };
  }

  // Free: giới hạn
  return {
    accessible: movies.slice(0, limit),
    restricted: movies.slice(limit),
  };
};
