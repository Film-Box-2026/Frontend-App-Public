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
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type TabType = 'profile' | 'watchlist' | 'history';

interface ProfilePageProps {
  initialTab?: TabType;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  initialTab = 'profile',
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const dispatch = useAppDispatch();
  const router = useRouter();

  const user = useAppSelector((state) => state.auth.user);
  const watchlist = useAppSelector((state) => state.watchlist.items);
  const history = useAppSelector((state) => state.history.items);
  const ratings = useAppSelector((state) => state.rating.items);
  const isVipActive = useAppSelector((state) => {
    const subscription = state.payment.subscription;
    if (!subscription || subscription.status !== 'active' || subscription.plan === 'free') {
      return false;
    }

    const expiryDate = new Date(subscription.expiryDate);
    return !Number.isNaN(expiryDate.getTime()) && expiryDate.getTime() > Date.now();
  });

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
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
          } catch {
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 40,
      paddingTop: 10,
      gap: 16,
    },
    topGlowWrap: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      height: 210,
      pointerEvents: 'none',
    },
    topGlow: {
      flex: 1,
      opacity: 0.25,
    },
    heroCard: {
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth: 1.2,
      borderColor: 'rgba(255,255,255,0.14)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 18,
      elevation: 8,
    },
    heroGradient: {
      paddingHorizontal: 16,
      paddingVertical: 16,
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
      letterSpacing: 0.4,
      textTransform: 'uppercase',
    },
    memberAccent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: 'rgba(13, 18, 29, 0.36)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.18)',
    },
    memberAccentText: {
      color: '#D7E6FF',
      fontSize: 11,
      fontWeight: '700',
    },
    heroMain: {
      marginTop: 14,
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
      fontSize: 21,
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
      marginTop: 12,
    },
    statCard: {
      width: '48.5%',
      borderRadius: 13,
      paddingVertical: 12,
      paddingHorizontal: 10,
      backgroundColor: 'rgba(0,0,0,0.2)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.12)',
      gap: 4,
    },
    statTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
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
    sectionShell: {
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
      backgroundColor:
        colorScheme === 'dark'
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(255,255,255,0.96)',
    },
    sectionHeader: {
      paddingHorizontal: 14,
      paddingTop: 14,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor:
        colorScheme === 'dark'
          ? 'rgba(255,255,255,0.05)'
          : 'rgba(0,0,0,0.06)',
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
      marginBottom: 2,
    },
    sectionSubtitle: {
      fontSize: 12,
      color: colors.tabIconDefault,
    },
    quickActionsRow: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 14,
      paddingBottom: 14,
      paddingTop: 4,
    },
    quickAction: {
      flex: 1,
      borderRadius: 12,
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
      borderRadius: 14,
      padding: 5,
      backgroundColor:
        colorScheme === 'dark'
          ? 'rgba(255,255,255,0.07)'
          : 'rgba(0,0,0,0.06)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 11,
    },
    activeTab: {
      backgroundColor: '#2A3A5A',
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
      marginTop: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
      backgroundColor:
        colorScheme === 'dark'
          ? 'rgba(255,255,255,0.03)'
          : 'rgba(0,0,0,0.02)',
    },
    emptyIcon: {
      fontSize: 52,
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
      marginTop: 10,
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
      marginTop: 12,
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
    settingsHeader: {
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.06)',
    },
    settingsHeaderTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    settingsHeaderSubtitle: {
      marginTop: 3,
      fontSize: 12,
      color: colors.tabIconDefault,
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
    notificationHeaderButton: {
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
    historyQuickCard: {
      borderRadius: 14,
      padding: 12,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
      backgroundColor:
        colorScheme === 'dark'
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(0,0,0,0.03)',
      gap: 10,
    },
    historyQuickTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
  });

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa đăng nhập</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.topGlowWrap}>
        <LinearGradient
          colors={['rgba(68,124,209,0.45)', 'rgba(26,34,55,0)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.topGlow}
        />
      </View>

      <Header
        title="Tài Khoản"
        showSearchIcon={false}
        rightContent={(
          <Pressable
            style={styles.notificationHeaderButton}
            onPress={handleNotifications}
          >
            <Ionicons name="notifications-outline" size={21} color={colors.text} />
            <View style={styles.notificationBadge} />
          </Pressable>
        )}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
            <View style={styles.heroCard}>
              <LinearGradient
                colors={
                  colorScheme === 'dark'
                    ? ['#0F2644', '#28345A', '#3A1D46']
                    : ['#2D66BD', '#3D4E8A', '#5E3A8B']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroGradient}
              >
                <View style={styles.heroTopRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Film Box Member</Text>
                  </View>
                  <View style={styles.memberAccent}>
                    <Ionicons name="diamond-outline" size={14} color="#D7E6FF" />
                    <Text style={styles.memberAccentText}>
                      {isVipActive ? 'Premium' : 'Standard'}
                    </Text>
                  </View>
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
                    <View style={styles.statTopRow}>
                      <Text style={styles.statLabel}>Phim đã lưu</Text>
                      <Ionicons name="bookmark-outline" size={14} color="#CFE3FF" />
                    </View>
                    <Text style={styles.statValue}>{watchlist.length}</Text>
                  </View>
                  <View style={styles.statCard}>
                    <View style={styles.statTopRow}>
                      <Text style={styles.statLabel}>Lần xem</Text>
                      <Ionicons name="time-outline" size={14} color="#CFE3FF" />
                    </View>
                    <Text style={styles.statValue}>{history.length}</Text>
                  </View>
                  <View style={styles.statCard}>
                    <View style={styles.statTopRow}>
                      <Text style={styles.statLabel}>Đánh giá</Text>
                      <Ionicons name="star-outline" size={14} color="#CFE3FF" />
                    </View>
                    <Text style={styles.statValue}>{ratings.length}</Text>
                  </View>
                  <View style={styles.statCard}>
                    <View style={styles.statTopRow}>
                      <Text style={styles.statLabel}>Điểm TB</Text>
                      <Ionicons name="trending-up-outline" size={14} color="#CFE3FF" />
                    </View>
                    <Text style={styles.statValue}>{averageRating}</Text>
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
                        ? 'My List'
                        : 'Lịch sử'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {activeTab === 'profile' && (
              <>
                <View style={styles.sectionShell}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Phím tắt</Text>
                    <Text style={styles.sectionSubtitle}>Truy cập nhanh chức năng thường dùng</Text>
                  </View>
                  <View style={styles.quickActionsRow}>
                    <Pressable style={styles.quickAction} onPress={handleNotifications}>
                      <Ionicons name="notifications-outline" size={20} color={colors.tint} />
                      <Text style={styles.quickActionText}>Thông báo</Text>
                    </Pressable>
                    <Pressable style={styles.quickAction} onPress={handleAccount}>
                      <Ionicons name="person-circle-outline" size={20} color={colors.tint} />
                      <Text style={styles.quickActionText}>Tài khoản</Text>
                    </Pressable>
                    <Pressable style={styles.quickAction} onPress={handleDownload}>
                      <Ionicons name="download-outline" size={20} color={colors.tint} />
                      <Text style={styles.quickActionText}>Tải về</Text>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.settingsSection}>
                  <View style={styles.settingsHeader}>
                    <Text style={styles.settingsHeaderTitle}>Thiết lập</Text>
                    <Text style={styles.settingsHeaderSubtitle}>
                      Tùy chỉnh ứng dụng và bảo mật tài khoản
                    </Text>
                  </View>

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

                {recentHistory.length > 0 && (
                  <View style={styles.historyQuickCard}>
                    <Text style={styles.historyQuickTitle}>Vừa xem gần đây</Text>
                    {recentHistory.map((item, index) => (
                      <View key={`${item.movieId}-${index}`} style={styles.recentItem}>
                        <View style={styles.recentItemLeft}>
                          <View style={styles.recentBullet}>
                            <Ionicons name="play" size={13} color="#4CAF50" />
                          </View>
                          <Text style={styles.recentTitle} numberOfLines={1}>
                            {item.name}
                          </Text>
                        </View>
                        <Text style={styles.recentTime}>#{index + 1}</Text>
                      </View>
                    ))}
                  </View>
                )}
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
                    <Ionicons
                      name="bookmark-outline"
                      size={52}
                      color="rgba(255,255,255,0.5)"
                    />
                    <Text style={styles.emptyText}>My List trống</Text>
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
                    <Ionicons
                      name="time-outline"
                      size={52}
                      color="rgba(255,255,255,0.5)"
                    />
                    <Text style={styles.emptyText}>History trống</Text>
                    <Text style={styles.emptySubText}>
                      Phim bạn xem sẽ hiển thị ở đây
                    </Text>
                  </View>
                )}
              </>
            )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfilePage;
