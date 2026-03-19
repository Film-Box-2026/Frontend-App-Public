import { LoadingPage } from '@/components/LoadingPage';
import { Header, SearchInput } from '@/components/layout';
import { AnimeCarousel } from '@/components/ui/AnimeCarousel';
import { CategoryCard } from '@/components/ui/CategoryCard';
import { GenresDrawer } from '@/components/ui/GenresDrawer';
import { OptionsDrawer } from '@/components/ui/OptionsDrawer';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MovieBanner } from '@/pages/HomePage/components/MovieBanner';
import { MovieSlider } from '@/pages/HomePage/components/MovieSlider';
import {
  useGetCartoonMovies,
  useGetCountries,
  useGetCountryMovies,
  useGetGenreMovies,
  useGetGenres,
  useGetNewMovies,
} from '@/services/api/hooks';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const HomePage: React.FC = () => {
  const router = useRouter();
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [showOptionsDrawer, setShowOptionsDrawer] = useState(false);
  const [showSearchHeader, setShowSearchHeader] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const slideAnim = useRef(
    new Animated.Value(Dimensions.get('window').width)
  ).current;

  const optionsSlideAnim = useRef(
    new Animated.Value(Dimensions.get('window').width)
  ).current;

  const { data: moviesData, isLoading } = useGetNewMovies(1);
  const { data: genresData, isLoading: isLoadingGenres } = useGetGenres();
  const { data: americanMoviesData, isLoading: isLoadingAmerican } =
    useGetCountryMovies('au-my', { limit: 6, sort_field: 'modified.time' });
  const { data: vietnamMoviesData, isLoading: isLoadingVietnam } =
    useGetCountryMovies('viet-nam', { limit: 6, sort_field: 'modified.time' });
  const { data: koreaMoviesData, isLoading: isLoadingKorea } =
    useGetCountryMovies('han-quoc', { limit: 6, sort_field: 'modified.time' });
  const { data: fictionMovieData, isLoading: isLoadingFiction } =
    useGetGenreMovies('vien-tuong', { sort_field: 'modified.time' });
  const { data: cartoonMoviesData, isLoading: isLoadingCartoon } =
    useGetCartoonMovies();
  const { data: countriesData } = useGetCountries();

  const formatMovieUrl = (movie: any) => ({
    ...movie,
    poster_url: `https://phimimg.com/${movie.poster_url}`,
    thumb_url: `https://phimimg.com/${movie.thumb_url}`,
  });

  const americanMovies = americanMoviesData?.items?.map(formatMovieUrl) || [];
  const vietnamMovies = vietnamMoviesData?.items?.map(formatMovieUrl) || [];
  const koreaMovies = koreaMoviesData?.items?.map(formatMovieUrl) || [];
  const fictionMovies =
    fictionMovieData?.data?.items?.map(formatMovieUrl) || [];
  const formattedCartoonMovies = cartoonMoviesData?.map(formatMovieUrl) || [];

  const isDataLoading =
    isLoading ||
    isLoadingAmerican ||
    isLoadingVietnam ||
    isLoadingKorea ||
    isLoadingFiction ||
    isLoadingCartoon ||
    isLoadingGenres ||
    !moviesData?.items ||
    moviesData.items.length === 0 ||
    americanMovies.length === 0 ||
    vietnamMovies.length === 0 ||
    koreaMovies.length === 0 ||
    fictionMovies.length === 0 ||
    formattedCartoonMovies.length === 0;

  useEffect(() => {
    if (showAllGenres) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').width,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }

    if (showOptionsDrawer) {
      Animated.timing(optionsSlideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(optionsSlideAnim, {
        toValue: Dimensions.get('window').width,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [showAllGenres, slideAnim, showOptionsDrawer, optionsSlideAnim]);

  const styles = StyleSheet.create({
    safeContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      gap: 24,
      paddingBottom: 16,
    },
    categorySection: {
      paddingHorizontal: 16,
    },
    titleSection: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
    },
    categoriesContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    movieSliderSection: {
      gap: 24,
      backgroundColor: '#21232fff',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 10,
    },
    animeHeaderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    viewMoreButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
  });

  if (isDataLoading || !moviesData?.items || moviesData.items.length === 0) {
    return <LoadingPage message="Đang tải phim..." />;
  }

  const carouselMovies = moviesData.items.slice(0, 6).map((movie) => ({
    title: movie.name,
    subtitle: movie.origin_name,
    year: movie.year.toString(),
    backgroundImage: movie.poster_url,
    slug: movie.slug,
  }));

  return (
    <SafeAreaView
      style={styles.safeContainer}
      edges={['bottom', 'left', 'right']}
    >
      {showSearchHeader && (
        <SearchInput
          onMenuPress={() => {}}
          onSearchPress={() => {}}
          showSearchHeader={showSearchHeader}
          onCloseSearch={() => setShowSearchHeader(false)}
        />
      )}
      {!showSearchHeader && (
        <Header
          title="Trang chủ"
          onSearchPress={() => setShowSearchHeader(true)}
          onMenuPress={() => setShowOptionsDrawer(true)}
          showMenuIcon={true}
        />
      )}
      <View style={{ flex: 1 }}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <MovieBanner
              movies={carouselMovies}
              onPress={(movieIndex) => {
                const movie = carouselMovies[movieIndex];
                router.push({
                  pathname: '/detail',
                  params: { slug: movie.slug },
                });
              }}
            />
          </View>

          <View style={styles.categorySection}>
            <Text style={styles.titleSection}>Bạn đang quan tâm gì?</Text>
            <CategoryCard
              genresData={genresData || []}
              onViewMore={() => setShowAllGenres(true)}
            />
          </View>

          <View style={{ paddingHorizontal: 16 }}>
            <View style={styles.movieSliderSection}>
              <MovieSlider
                title="Phim Hàn Quốc mới"
                movies={koreaMovies}
                gradientColors={['#7B68EE', '#4A90E2', '#FF6B6B']}
                onMoviePress={(movie) => {
                  // Handle movie press
                }}
                onViewMore={() => {
                  router.push({
                    pathname: '/country-movies',
                    params: { slug: 'han-quoc', title: 'Phim Hàn Quốc' },
                  });
                }}
              />

              <MovieSlider
                title="Phim Âu Mỹ mới"
                movies={americanMovies}
                gradientColors={['#FF6B6B', '#FFA500', '#FFD700']}
                onMoviePress={(movie) => {
                  // Handle movie press
                }}
                onViewMore={() => {
                  router.push({
                    pathname: '/country-movies',
                    params: { slug: 'au-my', title: 'Phim Âu Mỹ' },
                  });
                }}
              />

              <MovieSlider
                title="Phim Việt Nam mới"
                movies={vietnamMovies}
                gradientColors={['#4A90E2', '#00CED1', '#32CD32']}
                onMoviePress={(movie) => {
                  // Handle movie press
                }}
                onViewMore={() => {
                  router.push({
                    pathname: '/country-movies',
                    params: { slug: 'viet-nam', title: 'Phim Việt Nam' },
                  });
                }}
              />
            </View>
          </View>

          <View style={styles.categorySection}>
            <MovieSlider
              title="Top 10 phim viễn tưởng"
              movies={fictionMovies}
              showViewMoreButton={false}
              gradientColors={['#fff', '#fff', '#fff']}
              displayLimit={10}
              titleStyle={{ color: colors.text }}
              viewMoreIconColor={colors.text}
              onMoviePress={(movie) => {
                // Handle movie press
              }}
              onViewMore={() => {
                // Navigate to all Vietnamese movies
              }}
            />
          </View>

          <View style={styles.categorySection}>
            <View style={styles.animeHeaderContainer}>
              <Text style={styles.titleSection}>Kho Tàng Anime Mới Nhất</Text>
              <Pressable
                style={styles.viewMoreButton}
                onPress={() => {
                  router.push('/anime-list');
                }}
                android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}
              >
                <Ionicons name="chevron-forward" size={24} color={'#fff'} />
              </Pressable>
            </View>
            <AnimeCarousel
              animes={formattedCartoonMovies.map((movie: any) => ({
                ...movie,
                thumb_url: movie.thumb_url || movie.poster_url,
              }))}
              onPress={(anime) => {
                router.push({
                  pathname: '/detail',
                  params: { slug: anime.slug },
                });
              }}
              onViewMore={() => {
                router.push('/anime-list');
              }}
            />
          </View>
        </ScrollView>
      </View>

      <GenresDrawer
        visible={showAllGenres}
        genres={genresData || []}
        slideAnim={slideAnim}
        onClose={() => setShowAllGenres(false)}
        title="Các chủ đề"
      />

      <OptionsDrawer
        visible={showOptionsDrawer}
        countries={countriesData || []}
        slideAnim={optionsSlideAnim}
        onClose={() => setShowOptionsDrawer(false)}
        title="Tuỳ chọn"
      />
    </SafeAreaView>
  );
};
