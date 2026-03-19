import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface GenreItem {
  _id: string;
  name: string;
  slug: string;
}

interface GenresDrawerProps {
  visible: boolean;
  genres: GenreItem[];
  slideAnim: Animated.Value;
  onClose: () => void;
  onGenrePress?: (genre: GenreItem) => void;
  title?: string;
}

export const GenresDrawer: React.FC<GenresDrawerProps> = ({
  visible,
  genres,
  slideAnim,
  onClose,
  onGenrePress,
  title = 'Các chủ đề',
}) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const categoryColors = [
    '#4A90E2',
    '#9B8FC4',
    '#4CAF50',
    '#9C27B0',
    '#FF6B6B',
    '#FFA500',
    '#00BCD4',
    '#FF69B4',
  ];

  const styles = StyleSheet.create({
    drawerContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      paddingBottom: insets.bottom,
      overflow: 'hidden',
      pointerEvents: visible ? 'auto' : 'none',
    },
    drawerContent: {
      flex: 1,
      backgroundColor: colors.background,
    },
    drawerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 16,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    drawerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
    },
    closeButton: {
      padding: 8,
    },
    closeButtonText: {
      fontSize: 28,
      color: colors.text,
    },
    genreRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
      gap: 12,
      paddingHorizontal: 16,
    },
    genreCard: {
      flex: 1,
      height: 80,
      borderRadius: 12,
      overflow: 'hidden',
    },
    genrePressable: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 12,
    },
    genreText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#fff',
      textAlign: 'center',
    },
  });

  const renderGenreCard = (genre: GenreItem, index: number) => (
    <View
      key={genre._id}
      style={[
        styles.genreCard,
        { backgroundColor: categoryColors[index % categoryColors.length] },
      ]}
    >
      <Pressable
        style={styles.genrePressable}
        onPress={() => {
          onClose();
          router.push({
            pathname: '/genre-movies',
            params: { slug: genre.slug, title: genre.name },
          });
        }}
        android_ripple={{ color: 'rgba(0, 0, 0, 0.2)' }}
      >
        <Text style={styles.genreText}>{genre.name}</Text>
      </Pressable>
    </View>
  );

  const renderGenreRow = ({ item }: { item: GenreItem[] }) => (
    <View style={styles.genreRow}>
      {item.map((genre, idx) =>
        renderGenreCard(genre, genres.indexOf(genre) || idx)
      )}
    </View>
  );

  const groupedGenres: GenreItem[][] = [];
  for (let i = 0; i < genres.length; i += 2) {
    groupedGenres.push(genres.slice(i, i + 2));
  }

  return (
    <View style={styles.drawerContainer}>
      <Animated.View
        style={[
          {
            transform: [{ translateX: slideAnim }],
          },
          styles.drawerContent,
        ]}
      >
        <View style={styles.drawerHeader}>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </Pressable>
          <Text style={styles.drawerTitle}>{title}</Text>
        </View>
        <FlatList
          data={groupedGenres}
          renderItem={renderGenreRow}
          keyExtractor={(_, index) => index.toString()}
          scrollEnabled={true}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
        />
      </Animated.View>
    </View>
  );
};
