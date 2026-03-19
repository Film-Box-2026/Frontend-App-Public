import { UserSubscription } from '@/constants/subscriptionPlans';
import { User } from '@/store/slices/Auth/authSlice';
import { MovieComment } from '@/store/slices/CommentSlice/commentSlice';
import { HistoryItem } from '@/store/slices/HistorySlice/historySlice';
import { VIPSubscription } from '@/store/slices/PaymentSlice/paymentSlice';
import { RatingItem } from '@/store/slices/RatingSlice/ratingSlice';
import { ResumePoint } from '@/store/slices/ResumeSlice/resumeSlice';
import { WatchlistItem } from '@/store/slices/WatchlistSlice/watchlistSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER: '@film_box_user',
  WATCHLIST: '@film_box_watchlist',
  HISTORY: '@film_box_history',
  RATINGS: '@film_box_ratings',
  RESUME_POINTS: '@film_box_resume_points',
  COMMENTS: '@film_box_comments',
  NOTIFICATION_READ_IDS: '@film_box_notification_read_ids',
  SUBSCRIPTION: '@film_box_subscription',
};

const memoryStorage: Record<string, string> = {};
let storageMode: 'unknown' | 'native' | 'memory' = 'unknown';

const resolveStorageMode = async (): Promise<'native' | 'memory'> => {
  if (storageMode === 'native' || storageMode === 'memory') {
    return storageMode;
  }

  try {
    const probeKey = '@film_box_probe';
    await AsyncStorage.setItem(probeKey, '1');
    await AsyncStorage.removeItem(probeKey);
    storageMode = 'native';
  } catch {
    storageMode = 'memory';
    console.warn('AsyncStorage native module unavailable, using in-memory fallback.');
  }

  return storageMode;
};

const setRawItem = async (key: string, value: string): Promise<void> => {
  const mode = await resolveStorageMode();
  if (mode === 'native') {
    await AsyncStorage.setItem(key, value);
    return;
  }
  memoryStorage[key] = value;
};

const getRawItem = async (key: string): Promise<string | null> => {
  const mode = await resolveStorageMode();
  if (mode === 'native') {
    return AsyncStorage.getItem(key);
  }
  return memoryStorage[key] ?? null;
};

const removeRawItem = async (key: string): Promise<void> => {
  const mode = await resolveStorageMode();
  if (mode === 'native') {
    await AsyncStorage.removeItem(key);
    return;
  }
  delete memoryStorage[key];
};

export const saveUser = async (user: User): Promise<void> => {
  try {
    await setRawItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

export const getUser = async (): Promise<User | null> => {
  try {
    const user = await getRawItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const removeUser = async (): Promise<void> => {
  try {
    await removeRawItem(STORAGE_KEYS.USER);
  } catch (error) {
    console.error('Error removing user:', error);
  }
};

export const saveWatchlist = async (watchlist: WatchlistItem[]): Promise<void> => {
  try {
    await setRawItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
  } catch (error) {
    console.error('Error saving watchlist:', error);
  }
};

export const getWatchlist = async (): Promise<WatchlistItem[]> => {
  try {
    const watchlist = await getRawItem(STORAGE_KEYS.WATCHLIST);
    return watchlist ? JSON.parse(watchlist) : [];
  } catch (error) {
    console.error('Error getting watchlist:', error);
    return [];
  }
};

export const saveHistory = async (history: HistoryItem[]): Promise<void> => {
  try {
    await setRawItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving history:', error);
  }
};

export const getHistory = async (): Promise<HistoryItem[]> => {
  try {
    const history = await getRawItem(STORAGE_KEYS.HISTORY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
};

export const upsertHistoryItem = async (
  item: HistoryItem
): Promise<HistoryItem[]> => {
  try {
    const current = await getHistory();
    const next = current.filter((h) => h.movieId !== item.movieId);
    next.unshift(item);
    const limited = next.slice(0, 50);
    await saveHistory(limited);
    return limited;
  } catch (error) {
    console.error('Error upserting history:', error);
    return [];
  }
};

export const saveRatings = async (ratings: RatingItem[]): Promise<void> => {
  try {
    await setRawItem(STORAGE_KEYS.RATINGS, JSON.stringify(ratings));
  } catch (error) {
    console.error('Error saving ratings:', error);
  }
};

export const getRatings = async (): Promise<RatingItem[]> => {
  try {
    const ratings = await getRawItem(STORAGE_KEYS.RATINGS);
    return ratings ? JSON.parse(ratings) : [];
  } catch (error) {
    console.error('Error getting ratings:', error);
    return [];
  }
};

export const saveResumePoints = async (resumePoints: { [key: string]: ResumePoint }): Promise<void> => {
  try {
    await setRawItem(STORAGE_KEYS.RESUME_POINTS, JSON.stringify(resumePoints));
  } catch (error) {
    console.error('Error saving resume points:', error);
  }
};

export const getResumePoints = async (): Promise<{ [key: string]: ResumePoint }> => {
  try {
    const resumePoints = await getRawItem(STORAGE_KEYS.RESUME_POINTS);
    return resumePoints ? JSON.parse(resumePoints) : {};
  } catch (error) {
    console.error('Error getting resume points:', error);
    return {};
  }
};

export const saveComments = async (
  commentsByMovieId: Record<string, MovieComment[]>
): Promise<void> => {
  try {
    await setRawItem(STORAGE_KEYS.COMMENTS, JSON.stringify(commentsByMovieId));
  } catch (error) {
    console.error('Error saving comments:', error);
  }
};

export const getComments = async (): Promise<Record<string, MovieComment[]>> => {
  try {
    const commentsByMovieId = await getRawItem(STORAGE_KEYS.COMMENTS);
    return commentsByMovieId ? JSON.parse(commentsByMovieId) : {};
  } catch (error) {
    console.error('Error getting comments:', error);
    return {};
  }
};

export const saveNotificationReadIds = async (readIds: string[]): Promise<void> => {
  try {
    await setRawItem(STORAGE_KEYS.NOTIFICATION_READ_IDS, JSON.stringify(readIds));
  } catch (error) {
    console.error('Error saving notification read IDs:', error);
  }
};

export const getNotificationReadIds = async (): Promise<string[]> => {
  try {
    const readIds = await getRawItem(STORAGE_KEYS.NOTIFICATION_READ_IDS);
    return readIds ? JSON.parse(readIds) : [];
  } catch (error) {
    console.error('Error getting notification read IDs:', error);
    return [];
  }
};

export const saveSubscription = async (subscription: VIPSubscription): Promise<void> => {
  try {
    await setRawItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(subscription));
  } catch (error) {
    console.error('Error saving subscription:', error);
  }
};

export const getSubscription = async (): Promise<VIPSubscription | null> => {
  try {
    const subscription = await getRawItem(STORAGE_KEYS.SUBSCRIPTION);
    return subscription ? JSON.parse(subscription) : null;
  } catch (error) {
    console.error('Error getting subscription:', error);
    return null;
  }
};

export const saveUserSubscription = async (
  subscription: UserSubscription
): Promise<void> => {
  try {
    await setRawItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(subscription));
  } catch (error) {
    console.error('Error saving user subscription:', error);
  }
};

export const getUserSubscription = async (): Promise<UserSubscription | null> => {
  try {
    const subscription = await getRawItem(STORAGE_KEYS.SUBSCRIPTION);
    return subscription ? JSON.parse(subscription) : null;
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return null;
  }
};

export const clearAllData = async (): Promise<void> => {
  try {
    await Promise.all(Object.values(STORAGE_KEYS).map((key) => removeRawItem(key)));
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
};
