import { Genre } from '@/services/api/hooks';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface CategoryCardProps {
  genresData: Genre[];
  onViewMore?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  genresData,
  onViewMore,
}) => {
  const router = useRouter();
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

  const displayedGenres = genresData?.slice(0, 6) || [];
  const remainingCount = (genresData?.length || 0) - 6;

  const styles = StyleSheet.create({
    scrollContainer: {
      overflow: 'hidden',
      borderRadius: 8,
      marginTop: 24,
    },
    categoriesContainer: {
      flexDirection: 'row',
      gap: 8,
      paddingRight: 16,
    },
    cardContainer: {
      width: 120,
      height: 70,
      borderRadius: 12,
      overflow: 'hidden',
    },
    pressable: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontSize: 14,
      fontWeight: '600',
      color: '#fff',
      textAlign: 'center',
      paddingHorizontal: 8,
    },
  });

  return (
    <ScrollView
      style={styles.scrollContainer}
      horizontal
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingLeft: 16 }}
    >
      <View style={styles.categoriesContainer}>
        {displayedGenres?.map((genre, index) => (
          <View
            key={genre._id}
            style={[
              styles.cardContainer,
              {
                backgroundColor: categoryColors[index % categoryColors.length],
              },
            ]}
          >
            <Pressable
              style={styles.pressable}
              onPress={() => {
                router.push({
                  pathname: '/genre-movies',
                  params: { slug: genre.slug, title: genre.name },
                });
              }}
              android_ripple={{ color: 'rgba(0, 0, 0, 0.2)' }}
            >
              <Text style={styles.text}>{genre.name}</Text>
            </Pressable>
          </View>
        ))}
        {remainingCount > 0 && (
          <View style={[styles.cardContainer, { backgroundColor: '#E67E22' }]}>
            <Pressable
              style={styles.pressable}
              onPress={onViewMore}
              android_ripple={{ color: 'rgba(0, 0, 0, 0.2)' }}
            >
              <Text style={styles.text}>+{remainingCount}</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
};
