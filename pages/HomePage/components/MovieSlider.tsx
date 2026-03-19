import { MovieCard } from '@/components/cards';
import { Ionicons } from '@expo/vector-icons';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from 'react-native';

interface Movie {
  _id: string;
  name: string;
  origin_name: string;
  poster_url: string;
  slug: string;
  year?: number;
  episode_current?: string;
  quality?: string;
}

interface MovieSliderProps {
  movies: Movie[];
  title: string;
  onMoviePress?: (movie: Movie) => void;
  onViewMore?: () => void;
  gradientColors?: string[];
  displayLimit?: number;
  showViewMoreButton?: boolean;
  titleStyle?: TextStyle;
  viewMoreIconName?: string;
  viewMoreIconColor?: string;
  viewMoreIconSize?: number;
}

export const MovieSlider: React.FC<MovieSliderProps> = ({
  movies,
  title,
  onMoviePress,
  onViewMore,
  gradientColors = ['#7B68EE', '#4A90E2', '#FF6B6B'],
  displayLimit = 6,
  showViewMoreButton = true,
  titleStyle,
  viewMoreIconName = 'chevron-forward',
  viewMoreIconColor = '#fff',
  viewMoreIconSize = 24,
}) => {
  const router = useRouter();
  const { width } = Dimensions.get('window');
  const movieCardWidth = (width - 40) / 3;

  const handleMoviePress = (movie: Movie) => {
    onMoviePress?.(movie);
    router.push({
      pathname: '/detail',
      params: { slug: movie.slug },
    });
  };

  const styles = StyleSheet.create({
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: '#fff',
    },
    viewMoreButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    viewMoreText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#4A90E2',
    },
    scrollContainer: {
      overflow: 'hidden',
      borderRadius: 8,
    },
    moviesGrid: {
      flexDirection: 'row',
      gap: 12,
    },
  });

  if (movies.length === 0) {
    return null;
  }

  const displayedMovies = movies.slice(0, displayLimit);

  return (
    <View>
      <View style={styles.headerContainer}>
        <View style={{ flex: 1 }}>
          {titleStyle ? (
            <Text style={[styles.title, titleStyle]}>{title}</Text>
          ) : (
            <MaskedView
              maskElement={
                <Text
                  style={[
                    styles.title,
                    { paddingHorizontal: 2, paddingVertical: 2 },
                  ]}
                >
                  {title}
                </Text>
              }
            >
              <LinearGradient
                colors={gradientColors as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ height: 40, width: '100%' }}
              />
            </MaskedView>
          )}
        </View>
        {displayedMovies.length > 0 && showViewMoreButton && (
          <Pressable
            style={styles.viewMoreButton}
            onPress={onViewMore}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}
          >
            <Ionicons
              name={viewMoreIconName as any}
              size={viewMoreIconSize}
              color={viewMoreIconColor}
            />
          </Pressable>
        )}
      </View>

      <ScrollView
        style={styles.scrollContainer}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        <View style={styles.moviesGrid}>
          {displayedMovies.map((movie) => (
            <MovieCard
              key={movie._id}
              movie={movie}
              onPress={handleMoviePress}
              width={movieCardWidth}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
