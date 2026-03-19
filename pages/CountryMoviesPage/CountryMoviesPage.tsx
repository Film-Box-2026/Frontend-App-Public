import { LoadingPage } from '@/components/LoadingPage';
import { Header } from '@/components/layout';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CartoonMovieCard } from '@/pages/CartoonPage/components';
import { useGetCountryMovies } from '@/services/api/hooks';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CountryMoviesPageProps {
  countrySlug: string;
  title: string;
}

export const CountryMoviesPage: React.FC<CountryMoviesPageProps> = ({
  countrySlug,
  title,
}) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [allMovies, setAllMovies] = useState<any[]>([]);

  const {
    data: countryMoviesData = { items: [] },
    isLoading,
    refetch,
  } = useGetCountryMovies(countrySlug, {
    page,
    limit: 20,
    sort_field: 'modified.time',
  });

  // Accumulate movies from different pages
  useEffect(() => {
    if (countryMoviesData?.items && countryMoviesData.items.length > 0) {
      if (page === 1) {
        setAllMovies(countryMoviesData.items);
      } else {
        setAllMovies((prevMovies) => [
          ...prevMovies,
          ...countryMoviesData.items,
        ]);
      }
    }
  }, [countryMoviesData, page]);

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
        title={title}
        showBackIcon={true}
        onBackPress={() => router.back()}
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
