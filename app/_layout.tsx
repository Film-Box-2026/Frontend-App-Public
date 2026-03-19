import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { RootProvider } from '@/providers/RootProvider';
import {
    getHistory,
    getRatings,
    getResumePoints,
    getUser,
    getWatchlist,
} from '@/services/storage/storageService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser } from '@/store/slices/Auth/authSlice';
import { setHistory } from '@/store/slices/HistorySlice/historySlice';
import { setRatings } from '@/store/slices/RatingSlice/ratingSlice';
import { setResumePoints } from '@/store/slices/ResumeSlice/resumeSlice';
import { setWatchlist } from '@/store/slices/WatchlistSlice/watchlistSlice';

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Restore auth data from AsyncStorage
    const restoreAuthData = async () => {
      try {
        const user = await getUser();
        if (user) {
          dispatch(setUser(user));

          // Restore other data
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
    return null; // Show splash screen until data is loaded
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1, paddingTop: insets.top }}>
        {isAuthenticated ? (
          <Stack screenOptions={{ headerShown: false }}>
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
          </Stack>
        ) : (
          <Stack initialRouteName="login" screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="login"
              options={{}}
            />
            <Stack.Screen
              name="signup"
              options={{
                animationEnabled: true,
              }}
            />
          </Stack>
        )}
      </View>
      <StatusBar style="auto" />
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
