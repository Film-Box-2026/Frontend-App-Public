import { Header } from '@/components/layout';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGetNewMovies } from '@/services/api/hooks';
import { saveNotificationReadIds } from '@/services/storage/storageService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addReadIds, setReadIds } from '@/store/slices/NotificationSlice/notificationSlice';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Keyboard,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type NotificationTab = 'all' | 'movies' | 'promos';

type NotificationItem = {
  id: string;
  category: 'movies' | 'promos';
  title: string;
  description: string;
  time: string;
  image: string;
  unread: boolean;
  slug?: string;
};



const resolveImage = (src: string) => {
  if (!src) return 'https://i.pravatar.cc/400?img=30';
  if (src.startsWith('http')) return src;
  return `https://phimimg.com/${src}`;
};

const toRelativeTime = (iso: string) => {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return 'just now';
  const diff = Date.now() - time;
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
};

const promoNotifications: NotificationItem[] = [
  {
    id: 'promo-1',
    category: 'promos',
    title: 'Renewal successful! Welcome back to the Premium 4K plan.',
    description: '',
    time: '2 weeks ago',
    image: 'https://i.pravatar.cc/400?img=35',
    unread: false,
  },
  {
    id: 'promo-2',
    category: 'promos',
    title: 'Ưu đãi mới cho gói Premium tháng này.',
    description: 'Nâng cấp để mở khóa chất lượng 4K và không quảng cáo.',
    time: '1 day ago',
    image: 'https://i.pravatar.cc/400?img=44',
    unread: false,
  },
];

export const NotificationPage: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: moviesData, isLoading } = useGetNewMovies(1);
  const reduxReadIds = useAppSelector((state) => state.notification.readIds);

  const [activeTab, setActiveTab] = useState<NotificationTab>('all');

  const movieNotifications = useMemo<NotificationItem[]>(() => {
    const items = moviesData?.items ?? [];
    return items.slice(0, 20).map((movie, index) => ({
      id: `movie-${movie._id}`,
      category: 'movies',
      title: `${movie.name} is now available!`,
      description: 'Watch it now before it gets spoiled!',
      time: toRelativeTime(movie.modified?.time || ''),
      image: resolveImage(movie.poster_url || movie.thumb_url || ''),
      unread: !reduxReadIds.includes(`movie-${movie._id}`) && index < 4,
      slug: movie.slug,
    }));
  }, [moviesData?.items, reduxReadIds]);

  const filteredNotifications = useMemo(() => {
    const promos = promoNotifications.map((item: NotificationItem, index: number) => ({
      ...item,
      unread: !reduxReadIds.includes(item.id) && index === 0,
    }));

    if (activeTab === 'movies') {
      return movieNotifications;
    }

    if (activeTab === 'promos') {
      return promos;
    }

    return [...movieNotifications, ...promos];
  }, [activeTab, movieNotifications, reduxReadIds]);

  const totalCount = movieNotifications.length + promoNotifications.length;

  const handleClear = useCallback(async () => {
    const ids = filteredNotifications.map((item: NotificationItem) => item.id);
    const newReadIds = Array.from(new Set([...reduxReadIds, ...ids]));
    dispatch(setReadIds(newReadIds));
    await saveNotificationReadIds(newReadIds);
  }, [filteredNotifications, reduxReadIds, dispatch]);

  const handleNotificationPress = useCallback((item: NotificationItem) => {
    if (item.category === 'movies' && item.slug) {
      const newReadIds = Array.from(new Set([...reduxReadIds, item.id]));
      dispatch(addReadIds([item.id]));
      saveNotificationReadIds(newReadIds);
      router.push({
        pathname: '/detail',
        params: { slug: item.slug },
      });
    }
  }, [reduxReadIds, dispatch, router]);

  
  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#0B0B0E' : colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#0B0B0E' : colors.background,
      paddingHorizontal: 14,
    },
    header: {
      marginTop: 4,
      marginBottom: 10,
    },
    clearButton: {
      minWidth: 70,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    },
    clearText: {
      fontSize: 14,
      color: colorScheme === 'dark' ? '#ECEDEE' : colors.text,
      fontWeight: '600',
    },
    tabs: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 26,
      marginBottom: 14,
      paddingLeft: 2,
    },
    tabButton: {
      paddingBottom: 8,
      borderBottomWidth: 3,
      borderBottomColor: 'transparent',
    },
    tabButtonActive: {
      borderBottomColor: '#FFFFFF',
    },
    tabText: {
      fontSize: 18,
      color: colorScheme === 'dark' ? '#DADCE2' : colors.tabIconDefault,
      fontWeight: '700',
    },
    tabTextActive: {
      color: colorScheme === 'dark' ? '#FFFFFF' : colors.text,
    },
    listContent: {
      paddingBottom: 24,
      gap: 12,
    },
    card: {
      borderRadius: 12,
      overflow: 'hidden',
      flexDirection: 'row',
      backgroundColor:
        colorScheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      borderWidth: 1,
      borderColor:
        colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)',
      minHeight: 108,
    },
    poster: {
      width: 92,
      height: '100%',
      backgroundColor: 'rgba(255,255,255,0.08)',
    },
    cardContent: {
      flex: 1,
      paddingHorizontal: 12,
      paddingVertical: 10,
      justifyContent: 'space-between',
    },
    cardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
      alignItems: 'flex-start',
    },
    cardTextBlock: {
      flex: 1,
      gap: 4,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      lineHeight: 22,
      color: colorScheme === 'dark' ? '#FFFFFF' : colors.text,
    },
    cardDescription: {
      fontSize: 14,
      lineHeight: 18,
      color: colorScheme === 'dark' ? '#D3D7E0' : colors.tabIconDefault,
    },
    dot: {
      width: 13,
      height: 13,
      borderRadius: 7,
      backgroundColor: '#FF2D55',
      marginTop: 3,
    },
    timeText: {
      marginTop: 8,
      fontSize: 13,
      color: colorScheme === 'dark' ? '#B8BBC6' : colors.tabIconDefault,
      fontWeight: '600',
    },
    emptyWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 80,
      gap: 8,
    },
    emptyText: {
      color: colorScheme === 'dark' ? '#FFFFFF' : colors.text,
      fontSize: 20,
      fontWeight: '700',
    },
    emptySubText: {
      color: colorScheme === 'dark' ? '#B8BBC6' : colors.tabIconDefault,
      fontSize: 14,
      fontWeight: '500',
    },
    loadingWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 80,
    },
  });

  return (
    <View style={styles.screen}>
      <SafeAreaView style={{ backgroundColor: colorScheme === 'dark' ? '#0B0B0E' : colors.background }} edges={['top']} />
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Header
          title={`Notifications (${totalCount})`}
          showBackIcon={true}
          onBackPress={() => router.back()}
          onSearchPress={() => router.push('/search')}
          showMenuIcon={false}
          rightContent={(
            <Pressable style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
          )}
        />
      </View>

      <View style={styles.tabs}>
        {([
          ['all', 'All'],
          ['movies', 'Movies'],
          ['promos', 'Promos'],
        ] as [NotificationTab, string][]).map(([key, label]) => (
          <Pressable
            key={key}
            onPress={() => setActiveTab(key)}
            style={[styles.tabButton, activeTab === key && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, activeTab === key && styles.tabTextActive]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={Keyboard.dismiss}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => handleNotificationPress(item)}
          >
            <Image source={{ uri: item.image }} style={styles.poster} />
            <View style={styles.cardContent}>
              <View style={styles.cardTop}>
                <View style={styles.cardTextBlock}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  {!!item.description && (
                    <Text style={styles.cardDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}
                </View>
                {item.unread ? <View style={styles.dot} /> : null}
              </View>
              <Text style={styles.timeText}>{item.time}</Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          isLoading && activeTab !== 'promos' ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={colors.tint} />
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>Không có thông báo</Text>
              <Text style={styles.emptySubText}>Mọi thứ đã được đọc</Text>
            </View>
          )
        }
      />
      </SafeAreaView>
    </View>
  );
};

export default NotificationPage;
