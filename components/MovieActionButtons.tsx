import { RatingComponent } from '@/components/ui/RatingComponent';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useWatchlistAndRating } from '@/hooks/useWatchlistAndRating';
import { useAppSelector } from '@/store/hooks';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

interface MovieActionButtonsProps {
  movieId: string;
  slug: string;
  movieName: string;
  posterUrl: string;
  onPlayPress: () => void;
  onResumePress?: () => void;
  hasResumeData?: boolean;
}

export const MovieActionButtons: React.FC<MovieActionButtonsProps> = ({
  movieId,
  slug,
  movieName,
  posterUrl,
  onPlayPress,
  onResumePress,
  hasResumeData = false,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { addToWatchlistHandler, removeFromWatchlistHandler, isInWatchlist, rateMovie, getMovieRating } =
    useWatchlistAndRating();

  const [isInList, setIsInList] = useState(isInWatchlist(movieId));
  const [movieRating, setMovieRating] = useState(getMovieRating(movieId)?.rating || 0);
  const [showRating, setShowRating] = useState(false);

  useEffect(() => {
    setIsInList(isInWatchlist(movieId));
  }, [movieId, isInWatchlist]);

  useEffect(() => {
    const rating = getMovieRating(movieId);
    setMovieRating(rating?.rating || 0);
  }, [movieId, getMovieRating]);

  const promptLogin = () => {
    Alert.alert('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để sử dụng tính năng này.', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng nhập',
        onPress: () => router.push('/login'),
      },
    ]);
  };

  const canRunProtectedAction = () => {
    if (isAuthenticated) {
      return true;
    }

    promptLogin();
    return false;
  };

  const handleToggleWatchlist = async () => {
    if (!canRunProtectedAction()) {
      return;
    }

    try {
      if (isInList) {
        await removeFromWatchlistHandler(movieId);
        setIsInList(false);
        Alert.alert('Thành công', 'Đã xóa khỏi watchlist');
      } else {
        await addToWatchlistHandler({
          movieId,
          slug,
          name: movieName,
          posterUrl,
        });
        setIsInList(true);
        Alert.alert('Thành công', 'Đã thêm vào watchlist');
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật watchlist');
    }
  };

  const handleRatingChange = async (rating: number) => {
    if (!canRunProtectedAction()) {
      return;
    }

    try {
      await rateMovie({
        movieId,
        slug,
        rating,
      });
      setMovieRating(rating);
      Alert.alert('Thành công', `Đã đánh giá ${rating} sao`);
      setShowRating(false);
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật rating');
    }
  };

  const styles = StyleSheet.create({
    container: {
      gap: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      padding: 16,
      borderRadius: 12,
    },
    primaryButtonsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    playButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.tint,
      paddingVertical: 12,
      borderRadius: 8,
      gap: 8,
    },
    resumeButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.tint,
      paddingVertical: 12,
      borderRadius: 8,
      gap: 8,
      opacity: 0.8,
    },
    secondaryButtonsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    secondaryButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      paddingVertical: 10,
      borderRadius: 8,
      gap: 6,
    },
    activeSecondaryButton: {
      backgroundColor: colors.tint,
    },
    buttonText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#fff',
    },
    ratingContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    ratingTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
  });

  return (
    <View style={styles.container}>
      {/* Play / Resume Buttons */}
      <View style={styles.primaryButtonsRow}>
        {hasResumeData && onResumePress ? (
          <>
            <Pressable
              style={styles.playButton}
              onPress={() => {
                if (!canRunProtectedAction()) {
                  return;
                }
                onPlayPress();
              }}
            >
              <Ionicons name="play" size={18} color="#fff" />
              <Text style={styles.buttonText}>Xem từ đầu</Text>
            </Pressable>
            <Pressable
              style={styles.resumeButton}
              onPress={() => {
                if (!canRunProtectedAction()) {
                  return;
                }
                onResumePress();
              }}
            >
              <Ionicons name="play-skip-back" size={18} color="#fff" />
              <Text style={styles.buttonText}>Tiếp tục</Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            style={styles.playButton}
            onPress={() => {
              if (!canRunProtectedAction()) {
                return;
              }
              onPlayPress();
            }}
          >
            <Ionicons name="play" size={18} color="#fff" />
            <Text style={styles.buttonText}>Xem ngay</Text>
          </Pressable>
        )}
      </View>

      {/* Watchlist & Rating Buttons */}
      <View style={styles.secondaryButtonsRow}>
        <Pressable
          style={[
            styles.secondaryButton,
            isInList && styles.activeSecondaryButton,
          ]}
          onPress={handleToggleWatchlist}
        >
          <Ionicons
            name={isInList ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color="#fff"
          />
          <Text style={styles.buttonText}>
            {isInList ? 'Đã lưu' : 'Lưu'}
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.secondaryButton,
            movieRating > 0 && styles.activeSecondaryButton,
          ]}
          onPress={() => setShowRating(!showRating)}
        >
          <Ionicons
            name={movieRating > 0 ? 'star' : 'star-outline'}
            size={18}
            color="#fff"
          />
          <Text style={styles.buttonText}>
            {movieRating > 0 ? `${movieRating}⭐` : 'Đánh giá'}
          </Text>
        </Pressable>
      </View>

      {/* Rating Selector */}
      {showRating && (
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingTitle}>Đánh giá phim</Text>
          <RatingComponent
            initialRating={movieRating}
            onRatingChange={handleRatingChange}
            size={20}
            showLabel={true}
          />
        </View>
      )}
    </View>
  );
};

export default MovieActionButtons;
