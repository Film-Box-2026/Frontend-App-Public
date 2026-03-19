import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface CartoonMovie {
  _id: string;
  name: string;
  origin_name: string;
  poster_url: string;
  slug: string;
  year?: number;
  episode_current?: string;
  quality?: string;
}

interface CartoonMovieCardProps {
  movie: CartoonMovie;
  width?: number;
}

export const CartoonMovieCard: React.FC<CartoonMovieCardProps> = ({
  movie,
  width,
}) => {
  const router = useRouter();

  const truncateMovieName = (value: string, maxWords = 2, maxChars = 24) => {
    if (!value) return '';

    const normalized = value.replace(/\s+/g, ' ').trim();
    if (!normalized) return '';

    const words = normalized.split(' ');
    if (words.length > maxWords) {
      return `${words.slice(0, maxWords).join(' ')} ...`;
    }

    if (normalized.length > maxChars) {
      return `${normalized.slice(0, maxChars).trim()} ...`;
    }

    return normalized;
  };

  const styles = StyleSheet.create({
    movieCard: {
      width: width || '48%',
      aspectRatio: 2 / 3,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: '#2a2a2a',
      marginVertical: 8,
    },
    movieImage: {
      width: '100%',
      aspectRatio: 2 / 3,
      backgroundColor: '#1a1a1a',
    },
    movieOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      justifyContent: 'flex-end',
      padding: 8,
    },
    movieBadges: {
      flexDirection: 'row',
      gap: 4,
      marginBottom: 8,
      flexWrap: 'wrap',
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '600',
      color: '#fff',
    },
    movieTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: '#fff',
      marginBottom: 4,
      lineHeight: 16,
    },
    movieSubtitle: {
      fontSize: 10,
      color: '#ccc',
      lineHeight: 14,
    },
  });

  const handlePress = () => {
    router.push({
      pathname: '/detail',
      params: { slug: movie.slug, name: movie.name },
    });
  };

  return (
    <Pressable
      style={styles.movieCard}
      onPress={handlePress}
      android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}
    >
      <ExpoImage
        source={{ uri: movie.poster_url }}
        style={styles.movieImage}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <View style={styles.movieOverlay}>
        {(movie.quality || movie.episode_current) && (
          <View style={styles.movieBadges}>
            {movie.quality && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{movie.quality}</Text>
              </View>
            )}
            {movie.episode_current && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{movie.episode_current}</Text>
              </View>
            )}
          </View>
        )}
        <Text style={styles.movieTitle} numberOfLines={2}>
          {truncateMovieName(movie.name, 2, 24)}
        </Text>
        <Text style={styles.movieSubtitle} numberOfLines={1}>
          {truncateMovieName(movie.origin_name || `${movie.year || ''}`, 3, 28)}
        </Text>
      </View>
    </Pressable>
  );
};
