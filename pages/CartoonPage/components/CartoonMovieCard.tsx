import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
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
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.95)']}
        locations={[0, 0.5, 1]}
        style={styles.movieOverlay}
      >
        {(movie.quality || movie.episode_current) && (
          <View style={styles.movieBadges}>
            {movie.quality && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{movie.quality}</Text>
              </View>
            )}
            {movie.episode_current && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: 'rgba(74, 144, 226, 0.8)' },
                ]}
              >
                <Text style={styles.badgeText}>{movie.episode_current}</Text>
              </View>
            )}
          </View>
        )}
        <Text style={styles.movieTitle} numberOfLines={2}>
          {movie.name}
        </Text>
        <Text style={styles.movieSubtitle} numberOfLines={1}>
          {movie.origin_name || `${movie.year || ''}`}
        </Text>
      </LinearGradient>
    </Pressable>
  );
};
