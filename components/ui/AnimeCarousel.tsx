import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Image as ExpoImage } from 'expo-image';
import React, { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { HtmlRenderer } from '../HtmlRenderer';

interface AnimeItem {
  _id: string;
  name: string;
  origin_name: string;
  poster_url: string;
  thumb_url: string;
  slug: string;
  year?: number;
  episode_current?: string;
  quality?: string;
  content?: string;
  category?: { _id: string; name: string }[];
  actor?: string[];
}

interface AnimeCarouselProps {
  animes: AnimeItem[];
  onPress?: (anime: AnimeItem) => void;
  onViewMore?: () => void;
}

export const AnimeCarousel: React.FC<AnimeCarouselProps> = ({
  animes,
  onPress,
  onViewMore,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const width = Math.round(screenWidth * 0.9);
  const [activeIndex, setActiveIndex] = useState(0);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  if (animes.length === 0) {
    return null;
  }

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      overflow: 'hidden',
    },
    carouselItem: {
      width: width,
      height: 500,
      overflow: 'hidden',
    },
    backgroundImage: {
      width: '100%',
      height: '100%',
      position: 'absolute',
    },
    overlay: {
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      padding: 20,
      justifyContent: 'flex-end',
    },
    contentWrapper: {
      gap: 12,
      zIndex: 10,
    },
    titleContainer: {
      gap: 4,
    },
    title: {
      fontSize: 24,
      fontWeight: '800',
      color: '#fff',
      lineHeight: 32,
    },
    originName: {
      fontSize: 13,
      color: '#FFD700',
      fontWeight: '500',
    },
    metaContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 8,
    },
    metaTag: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    metaText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    tag: {
      backgroundColor: 'rgba(100, 150, 200, 0.4)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: 'rgba(100, 150, 200, 0.6)',
    },
    tagText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '500',
    },
    description: {
      fontSize: 13,
      color: '#fff',
      lineHeight: 20,
      marginTop: 4,
    },
    paginationContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 16,
      paddingBottom: 12,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.text,
      opacity: 0.3,
    },
    activeDot: {
      width: 24,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.text,
      opacity: 1,
    },
  });

  const renderItem = ({ item }: { item: AnimeItem; index: number }) => {
    const imageUrl = item.thumb_url?.startsWith('http')
      ? item.thumb_url
      : `https://phimimg.com/${item.thumb_url || item.poster_url}`;

    const categories = item.category?.slice(0, 3).map((cat) => cat.name) || [];
    return (
      <Pressable onPress={() => onPress?.(item)} style={styles.carouselItem}>
        <ExpoImage
          source={{ uri: imageUrl }}
          style={styles.backgroundImage}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
        <View style={styles.overlay}>
          <View style={styles.contentWrapper}>
            <View style={styles.titleContainer}>
              <HtmlRenderer
                html={item.name}
                baseStyle={styles.title}
                tagsStyles={{
                  p: { margin: 0 },
                  span: { margin: 0 },
                  div: { margin: 0 },
                }}
              />
              <Text style={styles.originName} numberOfLines={1}>
                {item.origin_name}
              </Text>
            </View>

            <View style={styles.metaContainer}>
              {item.year && (
                <View style={styles.metaTag}>
                  <Text style={styles.metaText}>{item.year}</Text>
                </View>
              )}
              {item.quality && (
                <View style={styles.metaTag}>
                  <Text style={styles.metaText}>{item.quality}</Text>
                </View>
              )}
              {item.episode_current && (
                <View style={styles.metaTag}>
                  <Text style={styles.metaText}>{item.episode_current}</Text>
                </View>
              )}
            </View>

            {categories.length > 0 && (
              <View style={styles.tagsContainer}>
                {categories.map((cat, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{cat}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Carousel
        width={width}
        height={500}
        data={animes}
        renderItem={renderItem}
        onSnapToItem={(index) => {
          setActiveIndex(index);
        }}
        autoPlay
        autoPlayInterval={5000}
        scrollAnimationDuration={600}
        loop
      />

      <View style={styles.paginationContainer}>
        {animes.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, activeIndex === index && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
};
