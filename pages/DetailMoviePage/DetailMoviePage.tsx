import { MovieCard } from '@/components/cards';
import { LoadingPage } from '@/components/LoadingPage';
import { MovieActionButtons } from '@/components/MovieActionButtons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useResumeMovie } from '@/hooks/useResumeMovie';
import { useGetDetailMovie, useGetListMovies } from '@/services/api/hooks';
import { upsertHistoryItem } from '@/services/storage/storageService';
import { useAppDispatch } from '@/store/hooks';
import { addToHistory } from '@/store/slices/HistorySlice/historySlice';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VideoPlayerModal } from './components';

interface Episode {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
  link_m3u8: string;
}

export const DetailMoviePage: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams();
  const slug = typeof params.slug === 'string' ? params.slug : params.slug?.[0];

  const { data: detailData, isLoading } = useGetDetailMovie(slug);
  const [selectedServerIndex, setSelectedServerIndex] = useState(0);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(true);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [currentPlaybackDuration, setCurrentPlaybackDuration] = useState(0);
  const scrollY = new Animated.Value(0);

  const movieData = detailData?.movie;
  const episodes = detailData?.episodes || [];

  // New hooks for resume, watchlist, and history
  const resumeHook = useResumeMovie({
    movieId: movieData?._id || '',
    slug: movieData?.slug || '',
    episodeIndex: selectedServerIndex,
    totalDuration: currentPlaybackDuration,
  });

  const getTypeList = (
    type: string | undefined
  ): 'phim-bo' | 'phim-le' | null => {
    switch (type) {
      case 'series':
        return 'phim-bo';
      case 'single':
        return 'phim-le';
      default:
        return null;
    }
  };

  const typeList = movieData ? getTypeList(movieData.type) : null;
  const relatedMoviesParams =
    typeList && movieData
      ? {
          type_list: typeList,
          limit: 6,
          sort_field: 'modified.time',
        }
      : undefined;

  const { data: relatedMovies = [] } = useGetListMovies(relatedMoviesParams);

  const formattedMovieData = movieData;

  const getFirstPlayableEpisode = useCallback((): Episode | null => {
    const firstServer = episodes[0];
    if (!firstServer?.server_data?.length) return null;
    return firstServer.server_data[0] as Episode;
  }, [episodes]);

  const getEpisodeByServerIndex = useCallback(
    (serverIndex: number): Episode | null => {
      const safeIndex =
        serverIndex >= 0 && serverIndex < episodes.length ? serverIndex : 0;
      const server = episodes[safeIndex];
      if (!server?.server_data?.length) return null;
      return server.server_data[0] as Episode;
    },
    [episodes]
  );

  // Handle adding to history
  const addMovieToHistory = useCallback(async () => {
    if (!movieData) return;
    
    const historyItem = {
      movieId: movieData._id,
      slug: movieData.slug,
      name: movieData.name,
      posterUrl: movieData.poster_url,
      watchedAt: new Date().toISOString(),
      duration: currentPlaybackTime,
    };

    dispatch(addToHistory(historyItem));
    await upsertHistoryItem(historyItem);
  }, [movieData, dispatch, currentPlaybackTime]);

  // Handle play button
  const handlePlayPress = useCallback(() => {
    const firstEpisode = getFirstPlayableEpisode();
    if (!firstEpisode) {
      Alert.alert('Không thể phát', 'Phim này hiện chưa có link phát hợp lệ.');
      return;
    }

    addMovieToHistory();
    setCurrentPlaybackTime(0);
    setSelectedServerIndex(0);
    setSelectedEpisode(firstEpisode);
    setModalVisible(true);
  }, [getFirstPlayableEpisode, addMovieToHistory]);

  // Handle resume button
  const handleResumePress = useCallback(() => {
    const resumeData = resumeHook.getResumeData();
    if (resumeData) {
      const episodeToPlay = getEpisodeByServerIndex(resumeData.episodeIndex);
      if (!episodeToPlay) {
        Alert.alert('Không thể phát', 'Không tìm thấy tập phim để tiếp tục.');
        return;
      }

      addMovieToHistory();
      setSelectedServerIndex(
        resumeData.episodeIndex >= 0 && resumeData.episodeIndex < episodes.length
          ? resumeData.episodeIndex
          : 0
      );
      setSelectedEpisode(episodeToPlay);
      setCurrentPlaybackTime(resumeData.currentTime);
      setCurrentPlaybackDuration(resumeData.totalDuration || 0);
      setModalVisible(true);
      Alert.alert('Tiếp tục', `Tiếp tục từ ${Math.floor(resumeData.currentTime / 60)} phút`);
    }
  }, [resumeHook, episodes.length, addMovieToHistory, getEpisodeByServerIndex]);

  // Cleanup on unmount - save resume point
  useFocusEffect(
    useCallback(() => {
      return () => {
        if (movieData && modalVisible) {
          // Save a final resume point when leaving
          resumeHook.saveResumePoint(currentPlaybackTime);
        }
      };
    }, [movieData, modalVisible, resumeHook, currentPlaybackTime])
  );

  const handlePlaybackProgress = useCallback(
    ({ currentTime, duration }: { currentTime: number; duration: number }) => {
      setCurrentPlaybackTime(currentTime);
      setCurrentPlaybackDuration(duration);

      if (movieData) {
        resumeHook.saveResumePoint(currentTime);
      }
    },
    [movieData, resumeHook]
  );

  const handleClosePlayer = useCallback(async () => {
    if (movieData) {
      await resumeHook.saveResumePoint(currentPlaybackTime);
      await addMovieToHistory();
    }
    setModalVisible(false);
  }, [movieData, resumeHook, currentPlaybackTime, addMovieToHistory]);

  const headerBackgroundOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const styles = StyleSheet.create({
    safeContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerBackdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 60,
      backgroundColor: 'transparent',
      zIndex: 10,
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      flex: 1,
      marginLeft: 12,
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    shareButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      paddingTop: 0,
    },
    posterSection: {
      height: 350,
      backgroundColor: colors.background,
      overflow: 'hidden',
    },
    posterImage: {
      width: '100%',
      height: '100%',
    },
    infoSection: {
      paddingHorizontal: 16,
      paddingVertical: 20,
      gap: 16,
    },
    titleGroup: {
      gap: 4,
    },
    mainTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    originTitle: {
      fontSize: 14,
      color: colors.tabIconDefault,
    },
    metaInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap',
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 4,
    },
    metaText: {
      fontSize: 12,
      color: colors.text,
      fontWeight: '600',
    },
    ratingSection: {
      flexDirection: 'row',
      gap: 12,
    },
    ratingCard: {
      flex: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      gap: 4,
    },
    ratingSource: {
      fontSize: 12,
      color: colors.tabIconDefault,
    },
    ratingValue: {
      fontSize: 20,
      fontWeight: '700',
      color: '#FFD700',
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      padding: 16,
      borderRadius: 12,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#4A90E2',
      paddingVertical: 12,
      borderRadius: 8,
      gap: 8,
    },
    actionButtonSecondary: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      paddingVertical: 12,
      borderRadius: 8,
      gap: 8,
    },
    buttonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    descriptionSection: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 8,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    descriptionText: {
      fontSize: 14,
      color: colors.tabIconDefault,
      lineHeight: 20,
    },
    seasonsSection: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 12,
    },
    seasonTabs: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 12,
    },
    seasonTab: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    seasonTabActive: {
      backgroundColor: '#4A90E2',
    },
    seasonTabText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.tabIconDefault,
    },
    seasonTabTextActive: {
      color: '#fff',
    },
    episodeList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    episodeItem: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 8,
      width: 56,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
    },
    episodeItemActive: {
      backgroundColor: '#4A90E2',
    },
    episodeNumber: {
      fontSize: 12,
      fontWeight: '700',
      color: '#4A90E2',
    },
    episodeNumberActive: {
      color: '#fff',
    },
    episodeName: {
      display: 'none',
    },
    playIcon: {
      display: 'none',
    },
    relatedMoviesSection: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 12,
      paddingBottom: 40,
    },
    relatedMoviesGrid: {
      flexDirection: 'row',
      gap: 12,
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    relatedMovieName: {
      fontSize: 11,
      color: colors.text,
      fontWeight: '600',
      lineHeight: 14,
    },
  });

  const handleEpisodePress = (episode: Episode) => {
      addMovieToHistory();
    setSelectedEpisode(episode);
    setModalVisible(true);
  };

  const handleRelatedMoviePress = (movie: any) => {
    router.push({
      pathname: '/detail',
      params: { slug: movie.slug },
    });
  };

  const getRelatedMoviesWithFullUrl = (movies: any[]) => {
    return movies.map((movie) => ({
      ...movie,
      poster_url: `https://phimimg.com/${movie.poster_url}`,
    }));
  };

  if (isLoading || !formattedMovieData) {
    return <LoadingPage message="Đang tải chi tiết phim..." />;
  }

  return (
    <SafeAreaView
      style={styles.safeContainer}
      edges={['bottom', 'left', 'right']}
    >
      <Animated.View
        style={[
          styles.headerBackdrop,
          {
            backgroundColor: headerBackgroundOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: ['rgba(0, 0, 0, 0)', colors.background],
            }),
            marginTop: 0,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Animated.Text style={[styles.headerTitle]} numberOfLines={1}>
            {formattedMovieData.name}
          </Animated.Text>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.posterSection}>
          <ExpoImage
            source={{ uri: formattedMovieData.poster_url }}
            style={styles.posterImage}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        </View>

        <View style={styles.infoSection}>
          <View style={styles.titleGroup}>
            <Text style={styles.mainTitle}>{formattedMovieData.name}</Text>
            <Text style={styles.originTitle}>
              {formattedMovieData.origin_name}
            </Text>
          </View>

          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar" size={12} color="#4A90E2" />
              <Text style={styles.metaText}>{formattedMovieData.year}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="flash" size={12} color="#FFD700" />
              <Text style={styles.metaText}>HD</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="globe" size={12} color="#FF6B6B" />
              <Text style={styles.metaText}>{formattedMovieData.type}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.metaText}>
                TMDb: {formattedMovieData.tmdb.vote_average.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>

          {movieData && resumeHook && (
            <MovieActionButtons
              movieId={movieData._id}
              slug={movieData.slug}
              movieName={movieData.name}
              posterUrl={movieData.poster_url}
              onPlayPress={handlePlayPress}
              onResumePress={handleResumePress}
              hasResumeData={!!resumeHook.getResumeData()}
            />
          )}

        <View style={styles.descriptionSection}>
          <Pressable
            onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            style={styles.sectionHeader}
          >
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Ionicons
              name={isDescriptionExpanded ? 'chevron-down' : 'chevron-up'}
              size={16}
              color={colors.text}
            />
          </Pressable>
          {isDescriptionExpanded && (
            <Text style={styles.descriptionText}>
              {formattedMovieData.name} ({formattedMovieData.origin_name}) - Năm{' '}
              {formattedMovieData.year}
              {'\n\n'}
              {formattedMovieData.content}
            </Text>
          )}
        </View>

        <View style={styles.seasonsSection}>
          <Text style={styles.sectionTitle}>
            {formattedMovieData.type === 'single' ? 'Phim' : 'Tập phim'}
          </Text>

          {formattedMovieData.type === 'single' ? (
            <View style={styles.episodeList}>
              {episodes.length > 0 &&
                episodes[selectedServerIndex]?.server_data[0] && (
                  <Pressable
                    style={[
                      styles.episodeItem,
                      {
                        width: 'auto',
                        paddingHorizontal: 24,
                      },
                      selectedEpisode?.slug ===
                        episodes[selectedServerIndex]?.server_data[0]?.slug &&
                        styles.episodeItemActive,
                    ]}
                    onPress={() =>
                      handleEpisodePress(
                        episodes[selectedServerIndex]?.server_data[0]
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.episodeNumber,
                        selectedEpisode?.slug ===
                          episodes[selectedServerIndex]?.server_data[0]?.slug &&
                          styles.episodeNumberActive,
                      ]}
                    >
                      Full
                    </Text>
                  </Pressable>
                )}
            </View>
          ) : (
            episodes.length > 0 && (
              <>
                <View style={styles.seasonTabs}>
                  {episodes.map((server, index) => (
                    <Pressable
                      key={index}
                      style={[
                        styles.seasonTab,
                        selectedServerIndex === index && styles.seasonTabActive,
                      ]}
                      onPress={() => setSelectedServerIndex(index)}
                    >
                      <Text
                        style={[
                          styles.seasonTabText,
                          selectedServerIndex === index &&
                            styles.seasonTabTextActive,
                        ]}
                        numberOfLines={1}
                      >
                        {server.server_name}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <View style={styles.episodeList}>
                  {episodes[selectedServerIndex]?.server_data.map(
                    (episode, index) => (
                      <Pressable
                        key={episode.slug}
                        style={[
                          styles.episodeItem,
                          selectedEpisode?.slug === episode.slug &&
                            styles.episodeItemActive,
                        ]}
                        onPress={() => handleEpisodePress(episode)}
                      >
                        <Text
                          style={[
                            styles.episodeNumber,
                            selectedEpisode?.slug === episode.slug &&
                              styles.episodeNumberActive,
                          ]}
                        >
                          Tập {index + 1}
                        </Text>
                      </Pressable>
                    )
                  )}
                </View>
              </>
            )
          )}
        </View>

        <View style={styles.relatedMoviesSection}>
          <Text style={styles.sectionTitle}>Phim liên quan</Text>
          <View style={styles.relatedMoviesGrid}>
            {relatedMovies?.length > 0 ? (
              getRelatedMoviesWithFullUrl(relatedMovies)?.map((movie) => (
                <View key={movie._id} style={{ width: '31%' }}>
                  <MovieCard movie={movie} onPress={handleRelatedMoviePress} />
                </View>
              ))
            ) : (
              <Text style={styles.relatedMovieName}>
                Không có phim liên quan
              </Text>
            )}
          </View>
        </View>
      </Animated.ScrollView>

      <VideoPlayerModal
        visible={modalVisible}
        episode={selectedEpisode}
        onClose={handleClosePlayer}
        onProgress={handlePlaybackProgress}
      />
    </SafeAreaView>
  );
};
