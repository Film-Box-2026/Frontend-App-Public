import { Header } from '@/components/layout';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useWatchlistAndRating } from '@/hooks/useWatchlistAndRating';
import { useAppSelector } from '@/store/hooks';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type SortMode = 'recent' | 'oldest' | 'az';

export const MyListPage: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const router = useRouter();
  const watchlist = useAppSelector((state) => state.watchlist.items);
  const { removeFromWatchlistHandler } = useWatchlistAndRating();

  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('recent');

  const filteredMovies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    let data = [...watchlist];

    if (normalizedQuery.length > 0) {
      data = data.filter((item) => item.name.toLowerCase().includes(normalizedQuery));
    }

    if (sortMode === 'recent') {
      data.sort(
        (a, b) =>
          new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      );
    }

    if (sortMode === 'oldest') {
      data.sort(
        (a, b) =>
          new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()
      );
    }

    if (sortMode === 'az') {
      data.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    }

    return data;
  }, [watchlist, query, sortMode]);

  const styles = StyleSheet.create({
    safeContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 12,
    },
    heroCard: {
      borderRadius: 18,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.14)',
      marginBottom: 14,
    },
    heroGradient: {
      paddingHorizontal: 14,
      paddingVertical: 14,
    },
    heroTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    heroTitleWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    heroTitle: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '800',
    },
    heroSubtitle: {
      color: 'rgba(255,255,255,0.84)',
      fontSize: 12,
      marginTop: 2,
    },
    countPill: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: 'rgba(0,0,0,0.2)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.16)',
    },
    countPillText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '700',
    },
    searchBar: {
      marginTop: 12,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.16)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.16)',
      borderRadius: 12,
      height: 44,
      paddingHorizontal: 12,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      color: '#fff',
      fontSize: 14,
      paddingVertical: 0,
    },
    chipsRow: {
      marginTop: 12,
      flexDirection: 'row',
      gap: 8,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
      backgroundColor: 'rgba(255,255,255,0.07)',
    },
    chipActive: {
      borderColor: '#4A90E2',
      backgroundColor: 'rgba(74,144,226,0.28)',
    },
    chipText: {
      color: 'rgba(255,255,255,0.82)',
      fontSize: 12,
      fontWeight: '600',
    },
    chipTextActive: {
      color: '#fff',
      fontWeight: '700',
    },
    grid: {
      paddingTop: 12,
      paddingBottom: 20,
    },
    cardWrap: {
      width: '48%',
      marginBottom: 14,
    },
    posterWrap: {
      width: '100%',
      aspectRatio: 2 / 3,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: 'rgba(255,255,255,0.08)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
      marginBottom: 8,
    },
    poster: {
      width: '100%',
      height: '100%',
    },
    removeButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.22)',
    },
    movieName: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
      lineHeight: 18,
    },
    addedAt: {
      color: colors.tabIconDefault,
      fontSize: 11,
      marginTop: 2,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 28,
      gap: 10,
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '800',
      textAlign: 'center',
    },
    emptyText: {
      color: colors.tabIconDefault,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
    },
    discoverButton: {
      marginTop: 8,
      borderRadius: 12,
      paddingHorizontal: 18,
      paddingVertical: 12,
      backgroundColor: '#4A90E2',
    },
    discoverText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '700',
    },
    listContent: {
      paddingBottom: 20,
    },
  });

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Đã thêm gần đây';
    }

    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleOpenMovie = (slug: string) => {
    router.push({
      pathname: '/detail',
      params: { slug },
    });
  };

  const handleRemove = (movieId: string, movieName: string) => {
    Alert.alert('Xóa khỏi danh sách', `Bạn muốn xóa "${movieName}" khỏi My List?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          void removeFromWatchlistHandler(movieId);
        },
      },
    ]);
  };

  const renderHeader = () => (
    <View style={styles.heroCard}>
      <LinearGradient
        colors={['#123A67', '#1A2237', '#2E1E46']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroGradient}
      >
        <View style={styles.heroTopRow}>
          <View>
            <View style={styles.heroTitleWrap}>
              <Ionicons name="bookmark" size={18} color="#fff" />
              <Text style={styles.heroTitle}>My List</Text>
            </View>
            <Text style={styles.heroSubtitle}>Danh sách phim bạn đã lưu</Text>
          </View>

          <View style={styles.countPill}>
            <Text style={styles.countPillText}>{filteredMovies.length} phim</Text>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.75)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm trong danh sách của bạn..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.8)" />
            </Pressable>
          )}
        </View>

        <View style={styles.chipsRow}>
          {[
            { key: 'recent', label: 'Mới thêm' },
            { key: 'oldest', label: 'Cũ nhất' },
            { key: 'az', label: 'A-Z' },
          ].map((item) => {
            const isActive = sortMode === item.key;
            return (
              <Pressable
                key={item.key}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setSortMode(item.key as SortMode)}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );

  if (watchlist.length === 0) {
    return (
      <SafeAreaView style={styles.safeContainer} edges={['bottom', 'left', 'right']}>
        <View style={styles.container}>
          <Header title="My List" />
          <View style={styles.content}>
            <View style={styles.emptyContainer}>
              <Ionicons name="bookmark-outline" size={62} color="rgba(255,255,255,0.3)" />
              <Text style={styles.emptyTitle}>Danh sách đang trống</Text>
              <Text style={styles.emptyText}>
                Lưu phim bạn thích để xem lại nhanh hơn và quản lý dễ hơn.
              </Text>
              <Pressable
                style={styles.discoverButton}
                onPress={() => router.push('/(tabs)')}
              >
                <Text style={styles.discoverText}>Khám phá phim</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer} edges={['bottom', 'left', 'right']}>
      <View style={styles.container}>
        <Header title="My List" />
        <View style={styles.content}>
          <FlatList
            data={filteredMovies}
            numColumns={2}
            ListHeaderComponent={renderHeader}
            keyExtractor={(item) => item.movieId}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const posterUrl = item.posterUrl?.startsWith('http')
                ? item.posterUrl
                : `https://phimimg.com/${item.posterUrl}`;

              return (
                <View style={styles.cardWrap}>
                  <Pressable
                    style={styles.posterWrap}
                    onPress={() => handleOpenMovie(item.slug)}
                  >
                    <ExpoImage
                      source={{ uri: posterUrl }}
                      style={styles.poster}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                    />

                    <Pressable
                      style={styles.removeButton}
                      onPress={() => handleRemove(item.movieId, item.name)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#fff" />
                    </Pressable>
                  </Pressable>

                  <Text style={styles.movieName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.addedAt}>Đã lưu: {formatDate(item.addedAt)}</Text>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>Không tìm thấy phim phù hợp</Text>
                <Text style={styles.emptyText}>Thử đổi từ khóa tìm kiếm của bạn.</Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};
