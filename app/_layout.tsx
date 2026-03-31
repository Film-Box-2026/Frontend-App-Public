import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { RootProvider } from '@/providers/RootProvider';
import {
    getComments,
    getHistory,
    getNotificationReadIds,
    getPaymentTransactions,
    getRatings,
    getResumePoints,
    getSubscription,
    getUser,
    getWatchlist,
    saveSubscription,
} from '@/services/storage/storageService';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/Auth/authSlice';
import { setComments } from '@/store/slices/CommentSlice/commentSlice';
import { setHistory } from '@/store/slices/HistorySlice/historySlice';
import { setReadIds } from '@/store/slices/NotificationSlice/notificationSlice';
import { setSubscription, setTransactions, VIPSubscription } from '@/store/slices/PaymentSlice/paymentSlice';
import { setRatings } from '@/store/slices/RatingSlice/ratingSlice';
import { setResumePoints } from '@/store/slices/ResumeSlice/resumeSlice';
import { setWatchlist } from '@/store/slices/WatchlistSlice/watchlistSlice';

const normalizeSubscription = (subscription: VIPSubscription): VIPSubscription => {
  if (subscription.plan === 'free') {
    return {
      ...subscription,
      status: 'active',
    };
  }

  const expiryDate = new Date(subscription.expiryDate);
  if (Number.isNaN(expiryDate.getTime()) || expiryDate.getTime() <= Date.now()) {
    return {
      ...subscription,
      status: 'expired',
      autoRenewal: false,
    };
  }

  return {
    ...subscription,
    status: 'active',
  };
};

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const restoreAuthData = async () => {
      try {
        const commentsByMovieId = await getComments();
        if (Object.keys(commentsByMovieId).length > 0) {
          dispatch(setComments(commentsByMovieId));
        }

        const notificationReadIds = await getNotificationReadIds();
        if (notificationReadIds.length > 0) {
          dispatch(setReadIds(notificationReadIds));
        }

        const subscription = await getSubscription();
        if (subscription) {
          const normalized = normalizeSubscription(subscription);
          dispatch(setSubscription(normalized));
          if (normalized.status !== subscription.status) {
            await saveSubscription(normalized);
          }
        }

        const transactions = await getPaymentTransactions();
        if (transactions.length > 0) {
          dispatch(setTransactions(transactions));
        }

        const user = await getUser();
        if (user) {
          dispatch(setUser(user));
          const watchlist = await getWatchlist();
          const history = await getHistory();
          const ratings = await getRatings();
          const resumePoints = await getResumePoints();

          if (watchlist.length > 0) dispatch(setWatchlist(watchlist));
          if (history.length > 0) dispatch(setHistory(history));
          if (ratings.length > 0) dispatch(setRatings(ratings));
          if (Object.keys(resumePoints).length > 0) dispatch(setResumePoints(resumePoints));
        }
      } catch (error) {
        console.error('Error restoring auth data:', error);
      } finally {
        setIsReady(true);
      }
    };

    restoreAuthData();
  }, [dispatch]);

  if (!isReady) {
    return null; 
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName="(tabs)" screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="payment"
          options={{}}
        />
        <Stack.Screen
          name="transactions"
          options={{}}
        />
        <Stack.Screen
          name="subscription"
          options={{}}
        />
        <Stack.Screen
          name="(tabs)"
          options={{}}
        />
        <Stack.Screen
          name="detail"
          options={{}}
        />
        <Stack.Screen
          name="search"
          options={{}}
        />
        <Stack.Screen
          name="korea-movies"
          options={{}}
        />
        <Stack.Screen
          name="america-movies"
          options={{}}
        />
        <Stack.Screen
          name="vietnam-movies"
          options={{}}
        />
        <Stack.Screen
          name="anime-list"
          options={{}}
        />
        <Stack.Screen
          name="genre-movies"
          options={{}}
        />
        <Stack.Screen
          name="year-movies"
          options={{}}
        />
        <Stack.Screen
          name="country-movies"
          options={{}}
        />
        <Stack.Screen
          name="login"
          options={{}}
        />
        <Stack.Screen
          name="signup"
          options={{
            animation: 'slide_from_right',
          }}
        />
      </Stack>
      <StatusBar
        style={colorScheme === 'dark' ? 'light' : 'dark'}
        hidden={false}
        translucent={false}
      />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <RootProvider>
      <RootLayoutContent />
    </RootProvider>
  );
}
