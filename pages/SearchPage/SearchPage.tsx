import { MovieCard } from '@/components/cards';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSearchMovies } from '@/services/api/hooks';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const params = useLocalSearchParams<{ query?: string }>();

  useEffect(() => {
    if (params.query && typeof params.query === 'string') {
      setSearchQuery(params.query);
      setPage(1);
    }
  }, [params.query]);

  const { data: searchResults, isLoading } = useSearchMovies(
    {
      keyword: searchQuery,
      page,
      sort_field: 'modified.time',
    },
    { enabled: searchQuery.trim().length > 0 }
  );

  const formatMovieUrl = (movie: any) => ({
    ...movie,
    poster_url: movie.poster_url?.startsWith('http')
      ? movie.poster_url
      : `https://phimimg.com/${movie.poster_url}`,
    thumb_url: movie.thumb_url?.startsWith('http')
      ? movie.thumb_url
      : `https://phimimg.com/${movie.thumb_url}`,
  });

  const movies = searchResults?.data?.items?.map(formatMovieUrl) || [];
  const totalPages = searchResults?.data?.params?.pagination?.totalPages || 0;

  const styles = StyleSheet.create({
    safeContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    resultsContainer: {
      flex: 1,
      paddingHorizontal: 12,
    },
    movieCardWrapper: {
      flex: 1,
      padding: 4,
      marginBottom: 12,
    },
    noResultsContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    noResultsIcon: {
      fontSize: 64,
      marginBottom: 16,
      textAlign: 'center',
    },
    noResultsTitle: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
      textAlign: 'center',
    },
    noResultsText: {
      color: '#999',
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    paginationContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 20,
      paddingHorizontal: 16,
    },
    paginationButton: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: 'rgba(75, 144, 226, 0.2)',
      borderWidth: 1,
      borderColor: 'rgba(75, 144, 226, 0.5)',
      minWidth: 60,
      alignItems: 'center',
    },
    paginationButtonActive: {
      backgroundColor: 'rgba(75, 144, 226, 0.7)',
      borderColor: '#4A90E2',
    },
    paginationButtonDisabled: {
      opacity: 0.4,
    },
    paginationText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '600',
    },
    pageInfo: {
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: 12,
      marginHorizontal: 4,
    },
    resultInfoContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    resultInfoText: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: 13,
      fontWeight: '500',
    },
    customHeader: {
      height: 60,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchInputContainer: {
      flex: 1,
      height: 40,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 8,
      paddingHorizontal: 12,
      marginHorizontal: 12,
    },
    customSearchInput: {
      flex: 1,
      height: 40,
      color: '#fff',
      fontSize: 14,
      paddingHorizontal: 0,
    },
    clearButton: {
      padding: 6,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  const handleMoviePress = (movie: any) => {
    router.push({
      pathname: '/detail',
      params: { slug: movie.slug },
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const renderMovieCard = ({ item }: { item: any }) => (
    <View style={styles.movieCardWrapper}>
      <MovieCard movie={item} onPress={handleMoviePress} />
    </View>
  );

  const renderFooter = () => {
    if (movies.length === 0) return null;

    return (
      <View style={styles.paginationContainer}>
        <Pressable
          style={[
            styles.paginationButton,
            page === 1 && styles.paginationButtonDisabled,
          ]}
          onPress={() => page > 1 && setPage(page - 1)}
          disabled={page === 1}
        >
          <Text style={styles.paginationText}>← Trước</Text>
        </Pressable>
        <Text style={styles.pageInfo}>
          {page} / {totalPages}
        </Text>
        <Pressable
          style={[
            styles.paginationButton,
            page >= totalPages && styles.paginationButtonDisabled,
          ]}
          onPress={() => page < totalPages && setPage(page + 1)}
          disabled={page >= totalPages}
        >
          <Text style={styles.paginationText}>Sau →</Text>
        </Pressable>
      </View>
    );
  };

  const renderListHeader = () => {
    if (searchQuery.trim().length === 0 || movies.length === 0) return null;

    const totalItems = searchResults?.data?.params?.pagination?.totalItems || 0;

    return (
      <View style={styles.resultInfoContainer}>
        <Text style={styles.resultInfoText}>
          Tìm thấy{' '}
          <Text style={{ fontWeight: '700', color: '#4A90E2' }}>
            {totalItems}
          </Text>{' '}
          kết quả
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={styles.safeContainer}
      edges={['bottom', 'left', 'right']}
    >
      <View style={styles.customHeader}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </Pressable>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.customSearchInput}
            placeholder="Tìm kiếm phim..."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={() => handleSearch(searchQuery)}
          />
          {searchQuery.length > 0 && (
            <Pressable
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <MaterialIcons
                name="close"
                size={16}
                color="rgba(255, 255, 255, 0.6)"
              />
            </Pressable>
          )}
        </View>
      </View>

      {isLoading && searchQuery.trim().length > 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      ) : movies.length > 0 ? (
        <View style={styles.resultsContainer}>
          <FlatList
            data={movies}
            renderItem={renderMovieCard}
            keyExtractor={(item) => item._id}
            numColumns={3}
            scrollEventThrottle={16}
            ListHeaderComponent={renderListHeader}
            ListFooterComponent={renderFooter}
            scrollIndicatorInsets={{ right: 1 }}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={{
              justifyContent: 'space-between',
            }}
          />
        </View>
      ) : searchQuery.trim().length > 0 ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsTitle}>Không có kết quả</Text>
          <Text style={[styles.noResultsText, { marginTop: 12 }]}>
            Hãy thử tìm kiếm bằng từ khóa khác
          </Text>
        </View>
      ) : (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsTitle}>Hãy bắt đầu tìm kiếm</Text>
          <Text style={styles.noResultsText}>
            Nhập tên phim, anime hoặc diễn viên để tìm kiếm
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};
