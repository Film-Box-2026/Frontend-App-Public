import { MovieCard } from '@/components/cards';
import { LoadingPage } from '@/components/LoadingPage';
import { MovieActionButtons } from '@/components/MovieActionButtons';
import { showMovieLimitAlert } from '@/components/ui/VIPUpgradePrompt';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMovieComments } from '@/hooks/useMovieComments';
import { useResumeMovie } from '@/hooks/useResumeMovie';
import { useSubscription } from '@/hooks/useSubscription';
import { useGetDetailMovie, useGetListMovies } from '@/services/api/hooks';
import { upsertHistoryItem } from '@/services/storage/storageService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToHistory } from '@/store/slices/HistorySlice/historySlice';
import { checkMovieAccessibility } from '@/utils/subscriptionUtils';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VideoPlayerModal } from './components';
import { createDetailMovieStyles } from './styles';

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
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const history = useAppSelector((state) => state.history.items);
  const params = useLocalSearchParams();
  const slug = typeof params.slug === 'string' ? params.slug : params.slug?.[0];

  const { subscription } = useSubscription();
  const { data: detailData, isLoading } = useGetDetailMovie(slug);
  const [selectedServerIndex, setSelectedServerIndex] = useState(0);
  const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState(0);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(true);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [currentPlaybackDuration, setCurrentPlaybackDuration] = useState(0);
  const [commentText, setCommentText] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView | null>(null);

  const movieData = detailData?.movie;
  const episodes = detailData?.episodes || [];
  const resumeHook = useResumeMovie({
    movieId: movieData?._id || '',
    slug: movieData?.slug || '',
    serverIndex: selectedServerIndex,
    episodeIndex: selectedEpisodeIndex,
    episodeSlug: selectedEpisode?.slug,
    totalDuration: currentPlaybackDuration,
  });
  const { getMovieComments, addComment, canDeleteComment, deleteComment } =
    useMovieComments();

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

  const getEpisodeByIndexes = useCallback(
    (serverIndex: number, episodeIndex: number): Episode | null => {
      const safeServerIndex =
        serverIndex >= 0 && serverIndex < episodes.length ? serverIndex : 0;
      const serverEpisodes = episodes[safeServerIndex]?.server_data;
      if (!serverEpisodes?.length) return null;

      const safeEpisodeIndex =
        episodeIndex >= 0 && episodeIndex < serverEpisodes.length ? episodeIndex : 0;

      return serverEpisodes[safeEpisodeIndex] as Episode;
    },
    [episodes]
  );

  const findEpisodePositionBySlug = useCallback(
    (episodeSlug?: string) => {
      if (!episodeSlug) return null;

      for (let serverIndex = 0; serverIndex < episodes.length; serverIndex += 1) {
        const serverEpisodes = episodes[serverIndex]?.server_data || [];
        const episodeIndex = serverEpisodes.findIndex((ep: Episode) => ep.slug === episodeSlug);
        if (episodeIndex !== -1) {
          return { serverIndex, episodeIndex };
        }
      }

      return null;
    },
    [episodes]
  );

  const requireAuth = useCallback(() => {
    if (isAuthenticated) {
      return true;
    }

    Alert.alert('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để xem phim hoặc lưu danh sách cá nhân.', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng nhập',
        onPress: () => router.push('/login'),
      },
    ]);

    return false;
  }, [isAuthenticated, router]);
  const addMovieToHistory = useCallback(async (
    options?: {
      episode?: Episode | null;
      serverIndex?: number;
      episodeIndex?: number;
      duration?: number;
    }
  ) => {
    if (!movieData || !isAuthenticated) return;
    
    const resolvedServerIndex =
      typeof options?.serverIndex === 'number' ? options.serverIndex : selectedServerIndex;
    const resolvedEpisodeIndex =
      typeof options?.episodeIndex === 'number' ? options.episodeIndex : selectedEpisodeIndex;

    const historyItem = {
      movieId: movieData._id,
      slug: movieData.slug,
      name: movieData.name,
      posterUrl: movieData.poster_url,
      watchedAt: new Date().toISOString(),
      duration: typeof options?.duration === 'number' ? options.duration : currentPlaybackTime,
      lastServerIndex: resolvedServerIndex,
      lastEpisodeIndex: resolvedEpisodeIndex,
      lastEpisodeSlug: options?.episode?.slug || selectedEpisode?.slug,
    };

    dispatch(addToHistory(historyItem));
    await upsertHistoryItem(historyItem);
  }, [movieData, dispatch, currentPlaybackTime, isAuthenticated, selectedServerIndex, selectedEpisodeIndex, selectedEpisode]);

  const canAccessMovieBySubscription = useCallback(() => {
    const { canWatch } = checkMovieAccessibility(history.length, subscription);
    if (!canWatch) {
      showMovieLimitAlert(() => router.push('/subscription'));
      return false;
    }

    return true;
  }, [history.length, subscription, router]);

  const openEpisodePlayer = useCallback(
    (
      episode: Episode,
      options?: {
        serverIndex?: number;
        episodeIndex?: number;
        startTime?: number;
        duration?: number;
        resetCurrentTime?: boolean;
      }
    ) => {
      const resolvedServerIndex = typeof options?.serverIndex === 'number' ? options.serverIndex : selectedServerIndex;
      const resolvedEpisodeIndex = typeof options?.episodeIndex === 'number' ? options.episodeIndex : selectedEpisodeIndex;

      setSelectedServerIndex(resolvedServerIndex);
      setSelectedEpisodeIndex(resolvedEpisodeIndex);
      setSelectedEpisode(episode);

      addMovieToHistory({
        episode,
        serverIndex: resolvedServerIndex,
        episodeIndex: resolvedEpisodeIndex,
        duration: typeof options?.startTime === 'number' ? options.startTime : 0,
      });

      if (options?.resetCurrentTime) {
        setCurrentPlaybackTime(0);
      } else if (typeof options?.startTime === 'number') {
        setCurrentPlaybackTime(options.startTime);
      }

      if (typeof options?.duration === 'number') {
        setCurrentPlaybackDuration(options.duration);
      }

      setModalVisible(true);
    },
    [addMovieToHistory, selectedServerIndex, selectedEpisodeIndex]
  );

  const handlePlayPress = useCallback(() => {
    if (!requireAuth()) {
      return;
    }

    if (!canAccessMovieBySubscription()) {
      return;
    }

    const firstEpisode = getFirstPlayableEpisode();
    if (!firstEpisode) {
      Alert.alert('Không thể phát', 'Phim này hiện chưa có link phát hợp lệ.');
      return;
    }

    openEpisodePlayer(firstEpisode, {
      serverIndex: 0,
      episodeIndex: 0,
      resetCurrentTime: true,
      duration: 0,
    });
  }, [requireAuth, canAccessMovieBySubscription, getFirstPlayableEpisode, openEpisodePlayer]);

  const handleResumePress = useCallback(() => {
    if (!requireAuth()) {
      return;
    }

    if (!canAccessMovieBySubscription()) {
      return;
    }

    const resumeData = resumeHook.getResumeData();
    if (resumeData) {
      const matchedBySlug = findEpisodePositionBySlug(resumeData.episodeSlug);
      const fallbackServerIndex =
        resumeData.serverIndex >= 0 && resumeData.serverIndex < episodes.length
          ? resumeData.serverIndex
          : 0;

      const serverIndexToPlay = matchedBySlug?.serverIndex ?? fallbackServerIndex;
      const episodeIndexToPlay = matchedBySlug?.episodeIndex ?? resumeData.episodeIndex;
      const episodeToPlay = getEpisodeByIndexes(serverIndexToPlay, episodeIndexToPlay);

      if (!episodeToPlay) {
        Alert.alert('Không thể phát', 'Không tìm thấy tập phim để tiếp tục.');
        return;
      }

      openEpisodePlayer(episodeToPlay, {
        serverIndex: serverIndexToPlay,
        episodeIndex: episodeIndexToPlay,
        startTime: resumeData.currentTime,
        duration: resumeData.totalDuration || 0,
      });
    }
  }, [requireAuth, canAccessMovieBySubscription, resumeHook, episodes.length, findEpisodePositionBySlug, getEpisodeByIndexes, openEpisodePlayer]);
  useFocusEffect(
    useCallback(() => {
      return () => {
        if (movieData && modalVisible && isAuthenticated) {
          resumeHook.saveResumePoint(currentPlaybackTime);
        }
      };
    }, [movieData, modalVisible, resumeHook, currentPlaybackTime, isAuthenticated])
  );

  const handlePlaybackProgress = useCallback(
    ({ currentTime, duration }: { currentTime: number; duration: number }) => {
      setCurrentPlaybackTime(currentTime);
      setCurrentPlaybackDuration(duration);

      if (movieData && isAuthenticated) {
        resumeHook.saveResumePoint(currentTime);
      }
    },
    [movieData, resumeHook, isAuthenticated]
  );

  const handleClosePlayer = useCallback(async () => {
    if (movieData && isAuthenticated) {
      await resumeHook.saveResumePoint(currentPlaybackTime);
      await addMovieToHistory({
        episode: selectedEpisode,
        serverIndex: selectedServerIndex,
        episodeIndex: selectedEpisodeIndex,
        duration: currentPlaybackTime,
      });
    }
    setModalVisible(false);
  }, [movieData, resumeHook, currentPlaybackTime, addMovieToHistory, isAuthenticated, selectedEpisode, selectedServerIndex, selectedEpisodeIndex]);

  const headerBackgroundOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const styles = useMemo(() => createDetailMovieStyles(colors), [colors]);

  const handleEpisodePress = (episode: Episode, episodeIndex: number) => {
    if (!requireAuth()) {
      return;
    }

    if (!canAccessMovieBySubscription()) {
      return;
    }

    openEpisodePlayer(episode, {
      serverIndex: selectedServerIndex,
      episodeIndex,
      resetCurrentTime: true,
      duration: 0,
    });
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
      poster_url: movie.poster_url?.startsWith('http')
        ? movie.poster_url
        : `https://phimimg.com/${movie.poster_url}`,
    }));
  };

  const movieComments = movieData ? getMovieComments(movieData._id) : [];

  const formatCommentTime = (createdAt: string) => {
    const createdTime = new Date(createdAt).getTime();
    const now = Date.now();
    const diffMs = Math.max(0, now - createdTime);
    const minuteMs = 60 * 1000;
    const hourMs = 60 * minuteMs;
    const dayMs = 24 * hourMs;

    if (diffMs < minuteMs) {
      return 'Vừa xong';
    }

    if (diffMs < hourMs) {
      return `${Math.floor(diffMs / minuteMs)} phút trước`;
    }

    if (diffMs < dayMs) {
      return `${Math.floor(diffMs / hourMs)} giờ trước`;
    }

    return `${Math.floor(diffMs / dayMs)} ngày trước`;
  };

  const handleSubmitComment = async () => {
    if (!requireAuth()) {
      return;
    }

    if (!movieData) {
      return;
    }

    const normalizedComment = commentText.trim();
    if (!normalizedComment) {
      Alert.alert('Thiếu nội dung', 'Vui lòng nhập bình luận trước khi gửi.');
      return;
    }

    const isSaved = await addComment({
      movieId: movieData._id,
      content: normalizedComment,
    });

    if (isSaved) {
      setCommentText('');
      Alert.alert('Thành công', 'Bình luận của bạn đã được gửi.');
      return;
    }

    Alert.alert('Lỗi', 'Không thể gửi bình luận lúc này.');
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!movieData) {
      return;
    }

    Alert.alert('Xóa bình luận', 'Bạn có chắc muốn xóa bình luận này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          const isDeleted = await deleteComment({
            movieId: movieData._id,
            commentId,
          });

          if (!isDeleted) {
            Alert.alert('Lỗi', 'Không thể xóa bình luận này.');
          }
        },
      },
    ]);
  };

  if (isLoading || !formattedMovieData) {
    return <LoadingPage message="Đang tải chi tiết phim..." />;
  }

  const handleCommentInputFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 300);
  };

  const handleScrollViewTouchStart = () => {
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.safeContainer}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
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
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        onTouchStart={handleScrollViewTouchStart}
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
                        episodes[selectedServerIndex]?.server_data[0],
                        0
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
                        onPress={() => handleEpisodePress(episode, index)}
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

        <View style={styles.commentSection}>
          <Text style={styles.sectionTitle}>Bình luận</Text>

          {isAuthenticated ? (
            <View style={styles.commentInputWrapper}>
              <TextInput
                style={styles.commentInput}
                placeholder="Viết bình luận của bạn..."
                placeholderTextColor={colors.tabIconDefault}
                value={commentText}
                onChangeText={setCommentText}
                onFocus={handleCommentInputFocus}
                multiline
                maxLength={300}
              />
              <View style={styles.commentHeader}>
                <Text style={styles.commentHint}>
                  Chia sẻ cảm nhận của bạn về bộ phim này.
                </Text>
                <Pressable
                  style={styles.submitCommentButton}
                  onPress={handleSubmitComment}
                >
                  <Text style={styles.submitCommentText}>Gửi</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              style={styles.commentInputWrapper}
              onPress={() => requireAuth()}
            >
              <Text style={styles.commentHint}>
                Đăng nhập để gửi bình luận cho phim này.
              </Text>
            </Pressable>
          )}

          <View style={styles.commentsList}>
            {movieComments.length > 0 ? (
              movieComments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentUserName}>{comment.userName}</Text>
                    <View style={styles.commentMeta}>
                      <Text style={styles.commentTime}>
                        {formatCommentTime(comment.createdAt)}
                      </Text>
                      {canDeleteComment(comment) && (
                        <Pressable
                          style={styles.deleteCommentButton}
                          onPress={() => handleDeleteComment(comment.id)}
                        >
                          <Text style={styles.deleteCommentText}>Xóa</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                  <Text style={styles.commentContent}>{comment.content}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.commentHint}>
                Chưa có bình luận nào cho phim này.
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
    </KeyboardAvoidingView>
  );
};
