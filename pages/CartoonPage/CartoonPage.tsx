import { LoadingPage } from '@/components/LoadingPage';
import { Header } from '@/components/layout';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGetCartoonMovies } from '@/services/api/hooks';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CartoonMovieCard } from './components';

export const CartoonPage: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [allMovies, setAllMovies] = useState<any[]>([]);

  const {
    data: cartoonMovies = [],
    isLoading,
    refetch,
  } = useGetCartoonMovies({
    page,
  });

  useEffect(() => {
    if (cartoonMovies && cartoonMovies.length > 0) {
      if (page === 1) {
        setAllMovies(cartoonMovies);
      } else {
        setAllMovies((prevMovies) => [...prevMovies, ...cartoonMovies]);
      }
    }
  }, [cartoonMovies, page]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await refetch();
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!isLoading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const formatMovieUrl = (movie: any) => ({
    ...movie,
    poster_url: `https://phimimg.com/${movie.poster_url}`,
    thumb_url: `https://phimimg.com/${movie.thumb_url}`,
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    loadMoreContainer: {
      paddingVertical: 16,
      alignItems: 'center',
    },
  });

  if (isLoading && page === 1) {
    return <LoadingPage />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header
        title="Cartoon"
        onSearchPress={() => {
          // Handle search
        }}
        showSearchIcon={false}
      />
      <FlatList
        data={allMovies.map(formatMovieUrl)}
        renderItem={({ item }) => <CartoonMovieCard movie={item} />}
        keyExtractor={(item, index) => `${item._id}-${index}`}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-around' }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.tint}
          />
        }
        ListFooterComponent={
          isLoading && page > 1 ? (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator size="large" color={colors.tint} />
            </View>
          ) : null
        }
        scrollEventThrottle={16}
      />
    </SafeAreaView>
  );
};
