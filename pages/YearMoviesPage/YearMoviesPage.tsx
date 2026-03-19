import { LoadingPage } from '@/components/LoadingPage';
import { Header } from '@/components/layout';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CartoonMovieCard } from '@/pages/CartoonPage/components';
import { useGetYearMovies } from '@/services/api/hooks';
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

interface YearMoviesPageProps {
  year: string;
  title: string;
}

export const YearMoviesPage: React.FC<YearMoviesPageProps> = ({
  year,
  title,
}) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [allMovies, setAllMovies] = useState<any[]>([]);

  const {
    data: listData,
    isLoading,
    refetch,
  } = useGetYearMovies(year, {
    page,
  });

  useEffect(() => {
    if (!listData) return;

    let items: any[] = [];
    if (Array.isArray((listData as any).items)) {
      items = (listData as any).items;
    } else if (Array.isArray(listData)) {
      items = listData as any[];
    }

    if (items.length === 0) return;

    if (page === 1) setAllMovies(items);
    else setAllMovies((prev) => [...prev, ...items]);
  }, [listData, page]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await refetch();
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!isLoading) setPage((p) => p + 1);
  };

  const formatMovieUrl = (movie: any) => {
    const cdn =
      (listData && (listData as any).APP_DOMAIN_CDN_IMAGE) ||
      'https://phimimg.com';

    return {
      ...movie,
      poster_url: movie.poster_url?.startsWith('http')
        ? movie.poster_url
        : `${cdn.replace(/\/+$/, '')}/${movie.poster_url.replace(/^\/+/, '')}`,
      thumb_url: movie.thumb_url?.startsWith('http')
        ? movie.thumb_url
        : `${cdn.replace(/\/+$/, '')}/${movie.thumb_url.replace(/^\/+/, '')}`,
    };
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loadMoreContainer: { paddingVertical: 16, alignItems: 'center' },
  });

  if (isLoading && page === 1) return <LoadingPage />;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header
        title={`${title}`}
        showBackIcon={true}
        onBackPress={() => router.back()}
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
