import { MovieCard } from '@/components/cards';
import { Header } from '@/components/layout';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSubscription } from '@/hooks/useSubscription';
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
  const { subscription, isActive, remainingDays } = useSubscription();

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

  const handleDownload = () => {
    Alert.alert(
      'Download',
      'Tính năng download đang được phát triển. Vui lòng quay lại sau!',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleAppSettings = () => {
    Alert.alert(
      'App Settings',
      'Tính năng cài đặt ứng dụng đang được phát triển. Vui lòng quay lại sau!',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleNotifications = () => {
    router.push('/notifications');
  };

  const handleAccount = () => {
    router.push('/edit-account');
  };

  const handleHelpSupport = () => {
    Alert.alert(
      'Help & Support',
      'Tính năng hỗ trợ đang được phát triển. Vui lòng quay lại sau!',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Privacy',
      'Tính năng chính sách bảo mật đang được phát triển. Vui lòng quay lại sau!',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleUpgradeVIP = () => {
    router.push('/subscription');
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
    settingsSection: {
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
      backgroundColor:
        colorScheme === 'dark'
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(0,0,0,0.03)',
      marginVertical: 8,
    },
    settingsOptionRow: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.06)',
    },
    settingsOptionRowLast: {
      borderBottomWidth: 0,
    },
    settingsOptionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    settingsOptionText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    settingsOptionLogout: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FF6B6B',
    },
    notificationCornerButton: {
      position: 'absolute',
      right: 16,
      top: 14,
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        colorScheme === 'dark'
          ? 'rgba(255,255,255,0.08)'
          : 'rgba(0,0,0,0.08)',
      zIndex: 20,
    },
    notificationBadge: {
      position: 'absolute',
      right: 6,
      top: 6,
      width: 9,
      height: 9,
      borderRadius: 5,
      backgroundColor: '#FF2D55',
    },
    vipCard: {
      borderRadius: 16,
      padding: 14,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255,107,53,0.3)',
    },
    vipCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    vipLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    vipInfo: {
      gap: 4,
    },
    vipTitle: {
      fontSize: 16,
      fontWeight: '700',
    },
    vipSubtitle: {
      fontSize: 12,
      fontWeight: '500',
    },
    vipButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    vipButtonText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#FFF',
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

      <Pressable
        style={styles.notificationCornerButton}
        onPress={handleNotifications}
      >
        <Ionicons name="notifications-outline" size={21} color={colors.text} />
        <View style={styles.notificationBadge} />
      </Pressable>

      <FlatList
        data={[0]}
        keyExtractor={() => 'profile-page'}
        showsVerticalScrollIndicator={false}
        renderItem={() => null}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}
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
                <LinearGradient
                  colors={
                    subscription.currentPlan === 'basic' && isActive
                      ? ['#FF6B35', '#F7931E']
                      : colorScheme === 'dark'
                        ? ['rgba(255,107,53,0.15)', 'rgba(247,147,30,0.15)']
                        : ['rgba(255,107,53,0.1)', 'rgba(247,147,30,0.1)']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.vipCard}
                >
                  <View style={styles.vipCardContent}>
                    <View style={styles.vipLeft}>
                      <Ionicons
                        name="star"
                        size={32}
                        color={subscription.currentPlan === 'basic' && isActive ? '#FFF' : '#FF6B35'}
                      />
                      <View style={styles.vipInfo}>
                        <Text style={[styles.vipTitle, { color: subscription.currentPlan === 'basic' && isActive ? '#FFF' : colors.text }]}>
                          {subscription.currentPlan === 'basic' && isActive ? 'Gói Cơ Bản Đang Hoạt Động' : 'Nâng Cấp VIP'}
                        </Text>
                        <Text style={[styles.vipSubtitle, { color: subscription.currentPlan === 'basic' && isActive ? 'rgba(255,255,255,0.9)' : colors.tabIconDefault }]}>
                          {subscription.currentPlan === 'basic' && isActive
                            ? `Gói: basic • ${remainingDays} ngày còn lại`
                            : 'Hưởng quyền xem 4K, xem offline'}
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      style={[
                        styles.vipButton,
                        { backgroundColor: subscription.currentPlan === 'basic' && isActive ? 'rgba(0,0,0,0.2)' : '#FF6B35' },
                      ]}
                      onPress={handleUpgradeVIP}
                    >
                      <Text style={styles.vipButtonText}>
                        {subscription.currentPlan === 'basic' && isActive ? 'Chi tiết' : 'Nâng cấp'}
                      </Text>
                      <Ionicons name="chevron-forward" size={16} color="#FFF" />
                    </Pressable>
                  </View>
                </LinearGradient>

                <View style={styles.settingsSection}>
                  <Pressable style={styles.settingsOptionRow} onPress={handleDownload}>
                    <View style={styles.settingsOptionLeft}>
                      <Ionicons name="download" size={20} color={colors.tint} />
                      <Text style={styles.settingsOptionText}>Download</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
                  </Pressable>

                  <Pressable style={styles.settingsOptionRow} onPress={handleAppSettings}>
                    <View style={styles.settingsOptionLeft}>
                      <Ionicons name="settings" size={20} color={colors.tint} />
                      <Text style={styles.settingsOptionText}>App Settings</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
                  </Pressable>

                  <Pressable style={styles.settingsOptionRow} onPress={handleNotifications}>
                    <View style={styles.settingsOptionLeft}>
                      <Ionicons name="notifications" size={20} color={colors.tint} />
                      <Text style={styles.settingsOptionText}>Notifications</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
                  </Pressable>

                  <Pressable style={styles.settingsOptionRow} onPress={handleAccount}>
                    <View style={styles.settingsOptionLeft}>
                      <Ionicons name="person" size={20} color={colors.tint} />
                      <Text style={styles.settingsOptionText}>Account</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
                  </Pressable>

                  <Pressable style={styles.settingsOptionRow} onPress={handleHelpSupport}>
                    <View style={styles.settingsOptionLeft}>
                      <Ionicons name="help-circle" size={20} color={colors.tint} />
                      <Text style={styles.settingsOptionText}>Help & Support</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
                  </Pressable>

                  <Pressable style={styles.settingsOptionRow} onPress={handlePrivacy}>
                    <View style={styles.settingsOptionLeft}>
                      <Ionicons name="shield" size={20} color={colors.tint} />
                      <Text style={styles.settingsOptionText}>Privacy</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
                  </Pressable>

                  <Pressable
                    style={[styles.settingsOptionRow, styles.settingsOptionRowLast]}
                    onPress={handleLogout}
                    disabled={loggingOut}
                  >
                    <View style={styles.settingsOptionLeft}>
                      <Ionicons name="log-out" size={20} color="#FF6B6B" />
                      <Text style={styles.settingsOptionLogout}>
                        {loggingOut ? 'Đang đăng xuất...' : 'Logout'}
                      </Text>
                    </View>
                    {loggingOut && <ActivityIndicator color="#FF6B6B" size="small" />}
                  </Pressable>
                </View>
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
                      nestedScrollEnabled={false}
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
                      nestedScrollEnabled={false}
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
