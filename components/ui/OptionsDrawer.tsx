import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGetCountries, useGetGenres } from '@/services/api/hooks';
import { useAppDispatch } from '@/store/hooks';
import { setColorScheme } from '@/store/slices/themeSlice';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface GenreItem {
  _id: string;
  name: string;
  slug: string;
}

interface CountryItem {
  _id: string;
  name: string;
  slug?: string;
}

interface OptionsDrawerProps {
  visible: boolean;
  countries?: CountryItem[];
  slideAnim: Animated.Value;
  onClose: () => void;
  onGenrePress?: (genre: GenreItem) => void;
  onCountryPress?: (country: CountryItem) => void;
  onYearPress?: (year: number) => void;
  onToggleTheme?: (isDark: boolean) => void;
  title?: string;
}

export const OptionsDrawer: React.FC<OptionsDrawerProps> = ({
  visible,
  countries = [],
  slideAnim,
  onClose,
  onGenrePress,
  onCountryPress,
  onYearPress,
  onToggleTheme,
  title = 'Tùy chọn',
}) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const dispatch = useAppDispatch();
  const isDark = colorScheme === 'dark';
  const [openYears, setOpenYears] = useState(true);
  const [openGenres, setOpenGenres] = useState(false);
  const [openCountries, setOpenCountries] = useState(false);

  const yearsHeight = useRef(new Animated.Value(1)).current;
  const genresHeight = useRef(new Animated.Value(0)).current;
  const countriesHeight = useRef(new Animated.Value(0)).current;

  // measured content heights (used to create dynamic outputRange values)
  const [measuredYearsHeight, setMeasuredYearsHeight] = useState(0);
  const [measuredGenresHeight, setMeasuredGenresHeight] = useState(0);
  const [measuredCountriesHeight, setMeasuredCountriesHeight] = useState(0);

  const toggleYears = () => {
    const toValue = openYears ? 0 : 1;
    Animated.timing(yearsHeight, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setOpenYears(!openYears);
  };

  const toggleGenres = () => {
    const toValue = openGenres ? 0 : 1;
    Animated.timing(genresHeight, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setOpenGenres(!openGenres);
  };

  const toggleCountries = () => {
    const toValue = openCountries ? 0 : 1;
    Animated.timing(countriesHeight, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setOpenCountries(!openCountries);
  };

  const { data: genresData } = useGetGenres();
  const { data: countriesData } = useGetCountries();

  const years = useMemo(() => {
    const start = 2000;
    const end = 2025;
    const arr: number[] = [];
    for (let y = start; y <= end; y++) arr.push(y);
    return arr.reverse();
  }, []);

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
      borderBottomColor: 'rgba(0,0,0,0.08)',
    },
    drawerTitle: {
      fontSize: 20,
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
    section: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0,0,0,0.04)',
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderRadius: 8,
    },
    sectionToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#73737359',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    sectionBody: {
      marginTop: 12,
      gap: 12,
    },
    yearItem: {
      paddingVertical: 10,
    },
    yearText: {
      color: colors.text,
      fontSize: 14,
    },
    pill: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      marginRight: 8,
      marginBottom: 8,
      minWidth: 72,
      alignItems: 'center',
    },
    pillText: {
      color: '#fff',
      fontWeight: '600',
    },
    pillsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
    },
  });

  const handleToggleTheme = (value: boolean) => {
    dispatch(setColorScheme(value ? 'dark' : 'light'));
    if (onToggleTheme) onToggleTheme(value);
  };

  const handleYearPress = (year: number) => {
    if (onYearPress) return onYearPress(year);
    router.push({
      pathname: '/year-movies',
      params: { year: String(year), title: String(year) },
    });
  };

  const handleGenrePress = (genre: GenreItem) => {
    if (onGenrePress) return onGenrePress(genre);
    router.push({
      pathname: '/genre-movies',
      params: { slug: genre.slug, title: genre.name },
    });
  };

  const handleCountryPress = (country: CountryItem) => {
    if (onCountryPress) return onCountryPress(country);
    router.push({
      pathname: '/country-movies',
      params: { slug: country.slug ?? country.name, title: country.name },
    });
  };

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

        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          <View style={styles.section}>
            <View style={styles.sectionToggle}>
              <Text style={styles.sectionTitle}>Chế độ xem phim</Text>
              <Switch value={isDark} onValueChange={handleToggleTheme} />
            </View>
          </View>

          <View style={styles.section}>
            <Pressable onPress={toggleYears} style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Năm phim</Text>
              <Ionicons
                name={openYears ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.text}
              />
            </Pressable>
            <Animated.View
              style={[
                styles.sectionBody,
                {
                  height: yearsHeight.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, measuredYearsHeight || 400],
                  }),
                  opacity: yearsHeight,
                  overflow: 'hidden',
                },
              ]}
            >
              <View
                style={styles.pillsRow}
                onLayout={(e) => {
                  const h = e.nativeEvent.layout.height;
                  if (h && h !== measuredYearsHeight) setMeasuredYearsHeight(h);
                }}
              >
                {years.map((y) => (
                  <Pressable
                    key={y}
                    style={[
                      styles.pill,
                      { borderWidth: 1, borderColor: '#838383ff' },
                    ]}
                    onPress={() => handleYearPress(y)}
                  >
                    <Text style={[styles.pillText, { color: colors.text }]}>
                      {String(y)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>
          </View>

          <View style={styles.section}>
            <Pressable onPress={toggleGenres} style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Thể loại</Text>
              <Ionicons
                name={openGenres ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.text}
              />
            </Pressable>
            <Animated.View
              style={[
                styles.sectionBody,
                {
                  height: genresHeight.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, measuredGenresHeight || 0],
                  }),
                  opacity: genresHeight,
                  overflow: 'hidden',
                },
              ]}
            >
              <View
                style={styles.pillsRow}
                onLayout={(e) => {
                  const h = e.nativeEvent.layout.height;
                  if (h && h !== measuredGenresHeight)
                    setMeasuredGenresHeight(h);
                }}
              >
                {genresData?.map((g, idx) => (
                  <Pressable
                    key={g._id}
                    style={[
                      styles.pill,
                      {
                        backgroundColor:
                          categoryColors[idx % categoryColors.length],
                      },
                    ]}
                    onPress={() => handleGenrePress(g)}
                  >
                    <Text style={styles.pillText}>{g.name}</Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>
          </View>

          <View style={styles.section}>
            <Pressable onPress={toggleCountries} style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quốc gia</Text>
              <Ionicons
                name={openCountries ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.text}
              />
            </Pressable>
            <Animated.View
              style={[
                styles.sectionBody,
                {
                  height: countriesHeight.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, measuredCountriesHeight || 0],
                  }),
                  opacity: countriesHeight,
                  overflow: 'hidden',
                },
              ]}
            >
              <View
                style={styles.pillsRow}
                onLayout={(e) => {
                  const h = e.nativeEvent.layout.height;
                  if (h && h !== measuredCountriesHeight)
                    setMeasuredCountriesHeight(h);
                }}
              >
                {countriesData?.map((c, idx) => (
                  <Pressable
                    key={c._id}
                    style={[
                      styles.pill,
                      { borderWidth: 1, borderColor: '#838383ff' },
                    ]}
                    onPress={() => handleCountryPress(c)}
                  >
                    <Text style={[styles.pillText, { color: colors.text }]}>
                      {c.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>

            <View
              style={{
                position: 'absolute',
                opacity: 0,
                left: 0,
                right: 0,
                top: 0,
                pointerEvents: 'none',
              }}
            >
              <View
                onLayout={(e) => {
                  const h = e.nativeEvent.layout.height;
                  if (h && h !== measuredGenresHeight)
                    setMeasuredGenresHeight(h);
                }}
              >
                <View style={styles.pillsRow}>
                  {genresData?.map((g, idx) => (
                    <View key={g._id} style={styles.pill} />
                  ))}
                </View>
              </View>

              <View
                onLayout={(e) => {
                  const h = e.nativeEvent.layout.height;
                  if (h && h !== measuredCountriesHeight)
                    setMeasuredCountriesHeight(h);
                }}
              >
                <View style={styles.pillsRow}>
                  {countriesData?.map((c, idx) => (
                    <View key={c._id} style={styles.pill} />
                  ))}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};
