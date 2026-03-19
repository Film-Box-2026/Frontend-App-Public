import { MovieCard } from '@/components/cards';
import { Header } from '@/components/layout';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { clearAllData } from '@/services/storage/storageService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/Auth/authSlice';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type TabType = 'profile' | 'watchlist' | 'history';

export const ProfilePage: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const dispatch = useAppDispatch();
  const router = useRouter();

  const user = useAppSelector((state) => state.auth.user);
  const watchlist = useAppSelector((state) => state.watchlist.items);
  const history = useAppSelector((state) => state.history.items);
  const ratings = useAppSelector((state) => state.rating.items);

  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [loggingOut, setLoggingOut] = useState(false);

  const averageRating =
    ratings.length > 0
      ? (
          ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length
        ).toFixed(1)
      : '0.0';

  const recentHistory = history.slice(0, 3);

  const membershipDays = user?.createdAt
    ? Math.max(
        1,
        Math.floor(
          (Date.now() - new Date(user.createdAt).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 1;

  const handleLogout = () => {
    Alert.alert('Đăng Xuất', 'Bạn chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', onPress: () => {} },
      {
        text: 'Đăng Xuất',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await clearAllData();
            dispatch(logout());
            router.replace('/login');
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể đăng xuất');
            setLoggingOut(false);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const formatMovieUrl = (movie: any) => ({
    ...movie,
    poster_url: movie.posterUrl?.startsWith('http')
      ? movie.posterUrl
      : `https://phimimg.com/${movie.posterUrl}`,
    thumb_url: movie.posterUrl?.startsWith('http')
      ? movie.posterUrl
      : `https://phimimg.com/${movie.posterUrl}`,
  });

  const handleMoviePress = (item: any) => {
    router.push({
      pathname: '/detail',
      params: { slug: item.slug },
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 40,
      paddingTop: 12,
      gap: 16,
    },
    heroCard: {
      borderRadius: 18,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.12)',
    },
    heroGradient: {
      paddingHorizontal: 16,
      paddingVertical: 18,
    },
    heroTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: 'rgba(0,0,0,0.22)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.15)',
    },
    badgeText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    heroMain: {
      marginTop: 16,
      flexDirection: 'row',
      gap: 14,
      alignItems: 'center',
    },
    avatarWrapper: {
      width: 74,
      height: 74,
      borderRadius: 37,
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.35)',
      overflow: 'hidden',
      backgroundColor: 'rgba(255,255,255,0.16)',
    },
    avatar: {
      width: '100%',
      height: '100%',
    },
    heroInfo: {
      flex: 1,
      gap: 4,
    },
    userName: {
      fontSize: 22,
      fontWeight: '800',
      color: '#fff',
    },
    userEmail: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.82)',
    },
    memberText: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.82)',
      marginTop: 2,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 8,
      marginTop: 14,
    },
    statCard: {
      width: '48.5%',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 10,
      backgroundColor: 'rgba(0,0,0,0.2)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.12)',
      gap: 5,
    },
    statValue: {
      fontSize: 22,
      color: '#fff',
      fontWeight: '800',
    },
    statLabel: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.85)',
      fontWeight: '600',
    },
    sectionCard: {
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
      backgroundColor:
        colorScheme === 'dark'
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(0,0,0,0.03)',
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 10,
    },
    quickActionsRow: {
      flexDirection: 'row',
      gap: 10,
    },
    quickAction: {
      flex: 1,
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 8,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      backgroundColor:
        colorScheme === 'dark'
          ? 'rgba(255,255,255,0.06)'
          : 'rgba(255,255,255,0.95)',
    },
    quickActionText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.text,
    },
    recentItem: {
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.08)',
      gap: 10,
    },
    recentItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },
    recentBullet: {
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(76, 175, 80, 0.18)',
    },
    recentTitle: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '600',
      flex: 1,
    },
    recentTime: {
      fontSize: 11,
      color: colors.tabIconDefault,
    },
    tabContainer: {
      flexDirection: 'row',
      borderRadius: 12,
      padding: 4,
      backgroundColor:
        colorScheme === 'dark'
          ? 'rgba(255,255,255,0.06)'
          : 'rgba(0,0,0,0.06)',
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 10,
    },
    activeTab: {
      backgroundColor: colors.tint,
    },
    tabText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.tabIconDefault,
    },
    activeTabText: {
      color: '#fff',
    },
    logoutButton: {
      backgroundColor: '#FF6B6B',
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 10,
    },
    logoutButtonText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '700',
    },
    emptyContainer: {
      minHeight: 230,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
      marginTop: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
      backgroundColor:
        colorScheme === 'dark'
          ? 'rgba(255,255,255,0.03)'
          : 'rgba(0,0,0,0.02)',
    },
    emptyIcon: {
      fontSize: 44,
      marginBottom: 10,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: 17,
      color: colors.text,
      textAlign: 'center',
      fontWeight: '700',
      marginBottom: 6,
    },
    emptySubText: {
      fontSize: 13,
      color: colors.tabIconDefault,
      textAlign: 'center',
    },
    moviesGrid: {
      marginTop: 12,
    },
    movieCardWrapper: {
      flex: 1,
      paddingHorizontal: 5,
      marginBottom: 14,
    },
    cardSectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginTop: 14,
      marginBottom: 2,
    },
  });

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa đăng nhập</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header
        title="Tài Khoản"
        onSearchPress={() => {}}
        showSearchIcon={false}
      />

      <FlatList
        data={[0]}
        keyExtractor={() => 'profile-page'}
        showsVerticalScrollIndicator={false}
        renderItem={() => null}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <>
            <View style={styles.heroCard}>
              <LinearGradient
                colors={
                  colorScheme === 'dark'
                    ? ['#0f1f3a', '#3a1250', '#1b263b']
                    : ['#2575fc', '#6a11cb', '#1f4ea8']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroGradient}
              >
                <View style={styles.heroTopRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Film Box Member</Text>
                  </View>
                  <Ionicons name="sparkles" size={18} color="#fff" />
                </View>

                <View style={styles.heroMain}>
                  <View style={styles.avatarWrapper}>
                    {user.avatar ? (
                      <Image source={{ uri: user.avatar }} style={styles.avatar} />
                    ) : (
                      <View
                        style={[
                          styles.avatar,
                          {
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'rgba(255,255,255,0.15)',
                          },
                        ]}
                      >
                        <Ionicons name="person" size={32} color="#fff" />
                      </View>
                    )}
                  </View>
                  <View style={styles.heroInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <Text style={styles.memberText}>
                      Thành viên {membershipDays} ngày
                    </Text>
                  </View>
                </View>

                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{watchlist.length}</Text>
                    <Text style={styles.statLabel}>Phim đã lưu</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{history.length}</Text>
                    <Text style={styles.statLabel}>Lần xem gần đây</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{ratings.length}</Text>
                    <Text style={styles.statLabel}>Đánh giá đã gửi</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{averageRating}</Text>
                    <Text style={styles.statLabel}>Điểm trung bình</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            <View style={styles.tabContainer}>
              {(['profile', 'watchlist', 'history'] as TabType[]).map((tab) => (
                <Pressable
                  key={tab}
                  style={[styles.tab, activeTab === tab && styles.activeTab]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab && styles.activeTabText,
                    ]}
                  >
                    {tab === 'profile'
                      ? 'Tổng quan'
                      : tab === 'watchlist'
                        ? 'Watchlist'
                        : 'Lịch sử'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {activeTab === 'profile' && (
              <>
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
                  <View style={styles.quickActionsRow}>
                    <Pressable
                      style={styles.quickAction}
                      onPress={() => setActiveTab('watchlist')}
                    >
                      <Ionicons name="bookmark" size={18} color={colors.tint} />
                      <Text style={styles.quickActionText}>Xem đã lưu</Text>
                    </Pressable>
                    <Pressable
                      style={styles.quickAction}
                      onPress={() => setActiveTab('history')}
                    >
                      <Ionicons name="time" size={18} color={colors.tint} />
                      <Text style={styles.quickActionText}>Xem gần đây</Text>
                    </Pressable>
                    <Pressable
                      style={styles.quickAction}
                      onPress={() => router.push('/(tabs)')}
                    >
                      <Ionicons name="compass" size={18} color={colors.tint} />
                      <Text style={styles.quickActionText}>Khám phá</Text>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
                  {recentHistory.length > 0 ? (
                    recentHistory.map((item) => (
                      <Pressable
                        key={item.movieId}
                        style={styles.recentItem}
                        onPress={() => handleMoviePress(item)}
                      >
                        <View style={styles.recentItemLeft}>
                          <View style={styles.recentBullet}>
                            <Ionicons
                              name="play"
                              size={14}
                              color={colors.tint}
                            />
                          </View>
                          <Text style={styles.recentTitle} numberOfLines={1}>
                            {item.name}
                          </Text>
                        </View>
                        <Text style={styles.recentTime}>
                          {new Date(item.watchedAt).toLocaleDateString('vi-VN')}
                        </Text>
                      </Pressable>
                    ))
                  ) : (
                    <View style={[styles.emptyContainer, { minHeight: 140 }]}> 
                      <Text style={styles.emptyText}>Chưa có hoạt động</Text>
                      <Text style={styles.emptySubText}>
                        Hãy bắt đầu xem phim để tạo lịch sử
                      </Text>
                    </View>
                  )}
                </View>

                <Pressable
                  style={styles.logoutButton}
                  onPress={handleLogout}
                  disabled={loggingOut}
                >
                  {loggingOut ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.logoutButtonText}>Đăng Xuất</Text>
                  )}
                </Pressable>
              </>
            )}

            {activeTab === 'watchlist' && (
              <>
                <Text style={styles.cardSectionTitle}>Danh sách phim đã lưu</Text>
                {watchlist.length > 0 ? (
                  <View style={styles.moviesGrid}>
                    <FlatList
                      data={watchlist.map(formatMovieUrl)}
                      renderItem={({ item }) => (
                        <View style={styles.movieCardWrapper}>
                          <MovieCard movie={item} onPress={handleMoviePress} />
                        </View>
                      )}
                      keyExtractor={(item) => item.movieId}
                      numColumns={2}
                      columnWrapperStyle={{ justifyContent: 'space-between' }}
                      scrollEnabled={false}
                    />
                  </View>
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📽️</Text>
                    <Text style={styles.emptyText}>Watchlist trống</Text>
                    <Text style={styles.emptySubText}>
                      Hãy thêm phim yêu thích vào đây
                    </Text>
                  </View>
                )}
              </>
            )}

            {activeTab === 'history' && (
              <>
                <Text style={styles.cardSectionTitle}>Lịch sử xem của bạn</Text>
                {history.length > 0 ? (
                  <View style={styles.moviesGrid}>
                    <FlatList
                      data={history.map(formatMovieUrl)}
                      renderItem={({ item }) => (
                        <View style={styles.movieCardWrapper}>
                          <MovieCard movie={item} onPress={handleMoviePress} />
                        </View>
                      )}
                      keyExtractor={(item, index) => `${item.movieId}-${index}`}
                      numColumns={2}
                      columnWrapperStyle={{ justifyContent: 'space-between' }}
                      scrollEnabled={false}
                    />
                  </View>
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>⏰</Text>
                    <Text style={styles.emptyText}>History trống</Text>
                    <Text style={styles.emptySubText}>
                      Phim bạn xem sẽ hiển thị ở đây
                    </Text>
                  </View>
                )}
              </>
            )}
          </>
        }
      />
    </SafeAreaView>
  );
};

export default ProfilePage;
