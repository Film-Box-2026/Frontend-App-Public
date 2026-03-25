import { MovieCard } from '@/components/cards';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
    useAIRerankMovies,
    useAIRewriteQuery,
    useAISemanticIntent,
    useGetCountries,
    useGetGenres,
    useSearchMovies,
} from '@/services/api/hooks';
import { useAppSelector } from '@/store/hooks';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isAIMode, setIsAIMode] = useState(false);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const router = useRouter();
  const params = useLocalSearchParams<{ query?: string }>();

  const watchlist = useAppSelector((state) => state.watchlist.items);
  const history = useAppSelector((state) => state.history.items);
  const ratings = useAppSelector((state) => state.rating.items);

  const { data: genresData } = useGetGenres();
  const { data: countriesData } = useGetCountries();

  const genres = Array.isArray(genresData) ? genresData : [];
  const countries = Array.isArray(countriesData) ? countriesData : [];

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const list: string[] = [];
    for (let year = currentYear; year >= 1990; year -= 1) {
      list.push(String(year));
    }
    return list;
  }, []);

  const normalizeKeyword = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 420);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (params.query && typeof params.query === 'string') {
      setSearchQuery(params.query);
      setPage(1);
    }
  }, [params.query]);

  const { data: aiRewriteData, isFetching: isRewriting } = useAIRewriteQuery(
    debouncedQuery,
    {
      enabled: isAIMode && debouncedQuery.length > 2,
    }
  );

  const { data: aiSemanticData, isFetching: isInferringSemantic } =
    useAISemanticIntent(debouncedQuery, {
      enabled: isAIMode && debouncedQuery.length > 2,
    });

  const baseKeyword = searchQuery.trim();

  const effectiveKeyword = isAIMode
    ? aiRewriteData?.rewrittenQuery?.trim() ||
      aiSemanticData?.semanticQuery?.trim() ||
      baseKeyword
    : baseKeyword;

  const apiKeyword =
    effectiveKeyword.length > 0
      ? effectiveKeyword
      : selectedGenre || selectedCountry || selectedYear
        ? ''
        : '';

  const hasSearchCriteria =
    apiKeyword.length > 0 ||
    Boolean(selectedGenre) ||
    Boolean(selectedCountry) ||
    Boolean(selectedYear);

  const { data: searchResults, isLoading } = useSearchMovies(
    {
      keyword: apiKeyword,
      page,
      sort_field: 'modified.time',
      category: selectedGenre || undefined,
      country: selectedCountry || undefined,
      year: selectedYear || undefined,
    },
    { enabled: hasSearchCriteria }
  );

  const formatMovieUrl = (movie: any) => ({
    ...movie,
    poster_url: movie.poster_url?.startsWith('http')
      ? movie.poster_url
      : `https://phimimg.com/${movie.poster_url}`,
    thumb_url: movie.thumb_url?.startsWith('http')
      ? movie.thumb_url
      : `https://phimimg.com/${movie.thumb_url}`,
  });

  const rawMovies = searchResults?.data?.items?.map(formatMovieUrl) || [];

  const keywordVariants = useMemo(() => {
    const source = effectiveKeyword || baseKeyword;
    const original = source.trim();
    const noAccent = normalizeKeyword(source);
    const selectedGenreName =
      genres.find((item) => item.slug === selectedGenre)?.name || selectedGenre;
    const selectedCountryName =
      countries.find((item) => item.slug === selectedCountry)?.name ||
      selectedCountry;

    const stopWords = new Set([
      'phim',
      've',
      'la',
      'nhung',
      'hay',
      'co',
      'cua',
      'mot',
      'toi',
      'muon',
      'xem',
    ]);

    const topicTokens = noAccent
      .split(/\s+/)
      .filter(Boolean)
      .filter((token) => token.length > 2 && !stopWords.has(token));

    const compactTopic = topicTokens.slice(0, 4).join(' ');

    const filterOnlyCandidates =
      original.length === 0 &&
      Boolean(selectedGenre || selectedCountry || selectedYear)
        ? [
            'phim',
            String(selectedGenreName || '').trim(),
            String(selectedCountryName || '').trim(),
            String(selectedYear || '').trim(),
          ]
        : [];

    const variants = [original, noAccent, compactTopic, ...filterOnlyCandidates]
      .map((item) => String(item || '').trim())
      .filter(Boolean);
    const unique = new Set<string>();

    return variants.filter((item) => {
      const key = item.toLowerCase();
      if (unique.has(key)) return false;
      unique.add(key);
      return true;
    });
  }, [
    baseKeyword,
    countries,
    effectiveKeyword,
    genres,
    selectedCountry,
    selectedGenre,
    selectedYear,
  ]);

  const fallbackKeyword1 = keywordVariants[1] || keywordVariants[0] || '';
  const fallbackKeyword2 =
    keywordVariants[2] || (keywordVariants[1] !== fallbackKeyword1 ? keywordVariants[1] : '');

  const { data: fallbackResults1, isFetching: isLoadingFallback1 } = useSearchMovies(
    {
      keyword: fallbackKeyword1,
      page: 1,
      limit: 24,
      sort_field: 'modified.time',
      category: selectedGenre || undefined,
      country: selectedCountry || undefined,
      year: selectedYear || undefined,
    },
    {
      enabled: Boolean(fallbackKeyword1) && hasSearchCriteria && rawMovies.length === 0,
    }
  );

  const { data: fallbackResults2, isFetching: isLoadingFallback2 } = useSearchMovies(
    {
      keyword: fallbackKeyword2,
      page: 1,
      limit: 24,
      sort_field: 'modified.time',
      category: selectedGenre || undefined,
      country: selectedCountry || undefined,
      year: selectedYear || undefined,
    },
    {
      enabled:
        Boolean(fallbackKeyword2) &&
        hasSearchCriteria &&
        rawMovies.length === 0 &&
        (fallbackResults1?.data?.items?.length || 0) === 0,
    }
  );

  const fallbackMovies = useMemo(() => {
    const list1 = fallbackResults1?.data?.items?.map(formatMovieUrl) || [];
    const list2 = fallbackResults2?.data?.items?.map(formatMovieUrl) || [];
    const merged = [...list1, ...list2];
    const mapByKey = new Map<string, any>();

    merged.forEach((movie: any) => {
      const key = String(movie?.slug || movie?._id || '');
      if (!key) return;
      if (!mapByKey.has(key)) {
        mapByKey.set(key, movie);
      }
    });

    return Array.from(mapByKey.values());
  }, [fallbackResults1?.data?.items, fallbackResults2?.data?.items]);

  const baseResultMovies = rawMovies.length > 0 ? rawMovies : fallbackMovies;

  const relatedQueries = useMemo(() => {
    if (!isAIMode) {
      return [] as string[];
    }

    const base = new Set(
      [baseKeyword, effectiveKeyword]
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
    );

    return (aiSemanticData?.relatedQueries || [])
      .map((item: string) => item.trim())
      .filter(Boolean)
      .filter((item: string) => !base.has(item.toLowerCase()))
      .slice(0, 2);
  }, [aiSemanticData?.relatedQueries, baseKeyword, effectiveKeyword, isAIMode]);

  const { data: relatedSearchResults1, isLoading: isLoadingRelated1 } =
    useSearchMovies(
      {
        keyword: relatedQueries[0] || '',
        page: 1,
        limit: 18,
        sort_field: 'modified.time',
        category: selectedGenre || undefined,
        country: selectedCountry || undefined,
        year: selectedYear || undefined,
      },
      {
        enabled: isAIMode && Boolean(relatedQueries[0]),
      }
    );

  const { data: relatedSearchResults2, isLoading: isLoadingRelated2 } =
    useSearchMovies(
      {
        keyword: relatedQueries[1] || '',
        page: 1,
        limit: 18,
        sort_field: 'modified.time',
        category: selectedGenre || undefined,
        country: selectedCountry || undefined,
        year: selectedYear || undefined,
      },
      {
        enabled: isAIMode && Boolean(relatedQueries[1]),
      }
    );

  const relatedMovies1 = relatedSearchResults1?.data?.items?.map(formatMovieUrl) || [];
  const relatedMovies2 = relatedSearchResults2?.data?.items?.map(formatMovieUrl) || [];

  const aiCandidateMovies = useMemo(() => {
    if (!isAIMode) {
      return baseResultMovies;
    }

    const merged = [...baseResultMovies, ...relatedMovies1, ...relatedMovies2];
    const mapByKey = new Map<string, any>();

    merged.forEach((movie: any) => {
      const key = String(movie?.slug || movie?._id || '');
      if (!key) {
        return;
      }

      if (!mapByKey.has(key)) {
        mapByKey.set(key, movie);
      }
    });

    return Array.from(mapByKey.values());
  }, [baseResultMovies, isAIMode, relatedMovies1, relatedMovies2]);

  const { data: suggestionSearchResults, isFetching: isLoadingSuggestionPool } =
    useSearchMovies(
      {
        keyword: apiKeyword,
        page: 1,
        limit: 36,
        sort_field: 'modified.time',
        category: selectedGenre || undefined,
        country: selectedCountry || undefined,
        year: selectedYear || undefined,
      },
      {
        enabled:
          isAIMode &&
          (apiKeyword.length > 1 ||
            Boolean(selectedGenre) ||
            Boolean(selectedCountry) ||
            Boolean(selectedYear)),
      }
    );

  const suggestionPoolMovies =
    suggestionSearchResults?.data?.items?.map(formatMovieUrl) || [];

  const rerankPayload = useMemo(
    () => ({
      query: effectiveKeyword,
      movies: aiCandidateMovies.map((movie: any) => ({
        slug: movie.slug,
        name: movie.name,
        origin_name: movie.origin_name,
        year: movie.year,
        quality: movie.quality,
        episode_current: movie.episode_current,
      })),
      userSignals: {
        watchlist: watchlist.slice(0, 30).map((item) => item.name),
        history: history.slice(0, 30).map((item) => item.name),
        ratings: ratings.slice(0, 50).map((item) => ({
          movieId: item.movieId,
          rating: item.rating,
        })),
      },
    }),
    [aiCandidateMovies, effectiveKeyword, history, ratings, watchlist]
  );

  const { data: aiRerankData } = useAIRerankMovies(rerankPayload, {
    enabled: isAIMode && hasSearchCriteria && aiCandidateMovies.length > 1,
  });

  const movies = useMemo(() => {
    if (!isAIMode) {
      return baseResultMovies;
    }

    if (!aiRerankData?.orderedSlugs?.length) {
      return aiCandidateMovies;
    }

    const mapBySlug = new Map(
      aiCandidateMovies.map((movie: any) => [movie.slug, movie])
    );
    const ranked = aiRerankData.orderedSlugs
      .map((slug: string) => mapBySlug.get(slug))
      .filter(Boolean);

    if (ranked.length === 0) {
      return aiCandidateMovies;
    }

    const rankedSet = new Set(ranked.map((movie: any) => movie.slug));
    const remaining = aiCandidateMovies.filter(
      (movie: any) => !rankedSet.has(movie.slug)
    );
    return [...ranked, ...remaining];
  }, [aiCandidateMovies, aiRerankData?.orderedSlugs, baseResultMovies, isAIMode]);

  const totalPages = searchResults?.data?.params?.pagination?.totalPages || 0;

  const styles = StyleSheet.create({
    safeContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    resultsContainer: {
      flex: 1,
      paddingHorizontal: 12,
    },
    movieCardWrapper: {
      flex: 1,
      padding: 4,
      marginBottom: 12,
    },
    noResultsContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    noResultsTitle: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
      textAlign: 'center',
    },
    noResultsText: {
      color: '#999',
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    paginationContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 20,
      paddingHorizontal: 16,
    },
    paginationButton: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: 'rgba(75, 144, 226, 0.2)',
      borderWidth: 1,
      borderColor: 'rgba(75, 144, 226, 0.5)',
      minWidth: 60,
      alignItems: 'center',
    },
    paginationButtonDisabled: {
      opacity: 0.4,
    },
    paginationText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '600',
    },
    pageInfo: {
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: 12,
      marginHorizontal: 4,
    },
    resultInfoContainer: {
      paddingHorizontal: 6,
      paddingVertical: 10,
      gap: 8,
    },
    resultInfoText: {
      color: 'rgba(255, 255, 255, 0.78)',
      fontSize: 13,
      fontWeight: '500',
    },
    aiHintWrap: {
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: 'rgba(74, 144, 226, 0.16)',
      borderWidth: 1,
      borderColor: 'rgba(74, 144, 226, 0.42)',
      gap: 4,
    },
    aiHintLabel: {
      color: '#BFD9FF',
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    aiHintText: {
      color: '#E9F2FF',
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 17,
    },
    customHeader: {
      height: 60,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchInputContainer: {
      flex: 1,
      height: 40,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 8,
      paddingHorizontal: 12,
      marginHorizontal: 12,
    },
    customSearchInput: {
      flex: 1,
      height: 40,
      color: '#fff',
      fontSize: 14,
      paddingHorizontal: 0,
    },
    clearButton: {
      padding: 6,
      justifyContent: 'center',
      alignItems: 'center',
    },
    aiModeButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.08)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.16)',
      marginLeft: 4,
    },
    aiModeButtonActive: {
      backgroundColor: 'rgba(74, 144, 226, 0.28)',
      borderColor: 'rgba(74, 144, 226, 0.72)',
    },
    aiModeButtonDot: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: '#44C767',
    },
    filterToggleButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(75, 144, 226, 0.2)',
      borderWidth: 1,
      borderColor: 'rgba(75, 144, 226, 0.6)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    aiBusyDot: {
      position: 'absolute',
      top: 7,
      right: 7,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#44C767',
    },
    suggestionsWrap: {
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom: 4,
    },
    suggestionsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    suggestionsTitle: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: 12,
      fontWeight: '700',
    },
    suggestionsRow: {
      flexDirection: 'row',
      gap: 8,
      paddingRight: 8,
    },
    suggestionChip: {
      borderRadius: 14,
      paddingHorizontal: 10,
      paddingVertical: 8,
      backgroundColor: 'rgba(255,255,255,0.08)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.18)',
    },
    suggestionChipText: {
      color: '#E8EEF7',
      fontSize: 12,
      fontWeight: '500',
    },
    filterPanel: {
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.08)',
      gap: 10,
    },
    filterSectionLabel: {
      color: 'rgba(255, 255, 255, 0.85)',
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 6,
    },
    filterRow: {
      flexDirection: 'row',
      gap: 8,
      paddingRight: 8,
    },
    filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.25)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    filterChipActive: {
      borderColor: '#4A90E2',
      backgroundColor: 'rgba(74, 144, 226, 0.25)',
    },
    filterChipText: {
      color: 'rgba(255, 255, 255, 0.82)',
      fontSize: 12,
      fontWeight: '500',
    },
    filterChipTextActive: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
    selectedInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 2,
    },
    selectedInfoText: {
      color: 'rgba(255, 255, 255, 0.72)',
      fontSize: 12,
      flex: 1,
      marginRight: 8,
    },
    clearFiltersButton: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: 'rgba(255, 107, 107, 0.2)',
      borderWidth: 1,
      borderColor: 'rgba(255, 107, 107, 0.45)',
    },
    clearFiltersText: {
      color: '#FFB3B3',
      fontSize: 12,
      fontWeight: '600',
    },
  });

  const aiSuggestions = useMemo(() => {
    if (!isAIMode || effectiveKeyword.length < 2) {
      return [] as Array<{ label: string; query: string; slug: string }>;
    }

    const normalize = (value: string) =>
      value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

    const keywordNormalized = normalize(effectiveKeyword);
    const keywordTokens = keywordNormalized.split(/\s+/).filter(Boolean);
    const yearInQuery = keywordNormalized.match(/\b(19|20)\d{2}\b/)?.[0];

    const watchlistSignals = watchlist
      .slice(0, 50)
      .map((item) => normalize(item.name || ''));
    const historySignals = history
      .slice(0, 50)
      .map((item) => normalize(item.name || ''));

    const ratingBySlug = new Map(
      ratings.map((item) => [String(item.slug || ''), Number(item.rating || 0)])
    );

    const candidateMap = new Map<string, any>();
    [...suggestionPoolMovies, ...aiCandidateMovies].forEach((movie: any) => {
      const key = String(movie?.slug || movie?._id || '');
      if (!key) {
        return;
      }
      if (!candidateMap.has(key)) {
        candidateMap.set(key, movie);
      }
    });

    const scored = Array.from(candidateMap.values())
      .map((movie: any) => {
        const title = String(movie?.name || '').trim();
        const origin = String(movie?.origin_name || '').trim();
        if (!title) {
          return null;
        }

        const nTitle = normalize(title);
        const nOrigin = normalize(origin);
        let score = 0;

        if (nTitle === keywordNormalized) score += 120;
        if (nTitle.startsWith(keywordNormalized)) score += 80;
        if (nTitle.includes(keywordNormalized)) score += 55;
        if (nOrigin.includes(keywordNormalized)) score += 25;

        keywordTokens.forEach((token) => {
          if (nTitle.includes(token)) score += 12;
          if (nOrigin.includes(token)) score += 7;
        });

        if (yearInQuery && String(movie?.year || '') === yearInQuery) {
          score += 18;
        }

        if (watchlistSignals.some((item) => item && nTitle.includes(item))) {
          score += 18;
        }

        if (historySignals.some((item) => item && nTitle.includes(item))) {
          score += 12;
        }

        const movieRating = ratingBySlug.get(String(movie?.slug || '')) || 0;
        score += movieRating * 2.5;

        const yearText = movie?.year ? ` (${String(movie.year)})` : '';

        return {
          score,
          label: `${title}${yearText}`,
          query: title,
          slug: String(movie?.slug || ''),
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 6) as Array<{
      score: number;
      label: string;
      query: string;
      slug: string;
    }>;

    const unique = new Set<string>();
    return scored.filter((item) => {
      if (unique.has(item.query)) {
        return false;
      }
      unique.add(item.query);
      return true;
    });
  }, [
    aiCandidateMovies,
    effectiveKeyword,
    history,
    isAIMode,
    ratings,
    suggestionPoolMovies,
    watchlist,
  ]);

  const isAIBusy =
    (isAIMode || rawMovies.length === 0) &&
    (
      isRewriting ||
      isInferringSemantic ||
      isLoadingSuggestionPool ||
      isLoadingRelated1 ||
      isLoadingRelated2 ||
      isLoadingFallback1 ||
      isLoadingFallback2
    );

  const handleMoviePress = (movie: any) => {
    router.push({
      pathname: '/detail',
      params: { slug: movie.slug },
    });
  };

  const applySuggestion = (item: { query: string; slug: string }) => {
    if (item.slug) {
      router.push({
        pathname: '/detail',
        params: { slug: item.slug },
      });
      return;
    }

    setSearchQuery(item.query);
    setPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const toggleFilterValue = (
    currentValue: string,
    nextValue: string,
    setter: (value: string) => void
  ) => {
    setter(currentValue === nextValue ? '' : nextValue);
    setPage(1);
  };

  const clearAllFilters = () => {
    setSelectedGenre('');
    setSelectedCountry('');
    setSelectedYear('');
    setPage(1);
  };

  const toggleAIMode = () => {
    setIsAIMode((prev) => {
      const nextMode = !prev;

      setPage(1);
      return nextMode;
    });
  };

  const renderMovieCard = ({ item }: { item: any }) => (
    <View style={styles.movieCardWrapper}>
      <MovieCard movie={item} onPress={handleMoviePress} />
    </View>
  );

  const renderFooter = () => {
    if (movies.length === 0 || isAIMode) {
      return null;
    }

    return (
      <View style={styles.paginationContainer}>
        <Pressable
          style={[
            styles.paginationButton,
            page === 1 && styles.paginationButtonDisabled,
          ]}
          onPress={() => page > 1 && setPage(page - 1)}
          disabled={page === 1}
        >
          <Text style={styles.paginationText}>← Trước</Text>
        </Pressable>

        <Text style={styles.pageInfo}>
          {page} / {totalPages}
        </Text>

        <Pressable
          style={[
            styles.paginationButton,
            page >= totalPages && styles.paginationButtonDisabled,
          ]}
          onPress={() => page < totalPages && setPage(page + 1)}
          disabled={page >= totalPages}
        >
          <Text style={styles.paginationText}>Sau →</Text>
        </Pressable>
      </View>
    );
  };

  const renderListHeader = () => {
    if (!hasSearchCriteria) {
      return null;
    }

    const totalItems = searchResults?.data?.params?.pagination?.totalItems || 0;

    return (
      <View style={styles.resultInfoContainer}>
        {movies.length > 0 && (
          <Text style={styles.resultInfoText}>
            {isAIMode ? 'AI tổng hợp ' : 'Tìm thấy '}
            <Text style={{ fontWeight: '700', color: '#4A90E2' }}>
              {isAIMode ? movies.length : totalItems}
            </Text>{' '}
            {isAIMode ? 'phim liên quan từ kho API' : 'kết quả'}
          </Text>
        )}

        {!isAIMode && rawMovies.length === 0 && fallbackMovies.length > 0 ? (
          <View style={styles.aiHintWrap}>
            <Text style={styles.aiHintLabel}>Keyword Fallback</Text>
            <Text style={styles.aiHintText}>
              Đã mở rộng tìm kiếm với: {keywordVariants.slice(1).join(' • ')}
            </Text>
          </View>
        ) : null}

        {isAIMode &&
          aiRewriteData?.rewrittenQuery &&
          aiRewriteData.rewrittenQuery !== searchQuery.trim() && (
            <View style={styles.aiHintWrap}>
              <Text style={styles.aiHintLabel}>AI Rewrite</Text>
              <Text style={styles.aiHintText}>{aiRewriteData.rewrittenQuery}</Text>
            </View>
          )}

        {isAIMode && aiSemanticData?.explanation ? (
          <View style={styles.aiHintWrap}>
            <Text style={styles.aiHintLabel}>AI Semantic</Text>
            <Text style={styles.aiHintText}>{aiSemanticData.explanation}</Text>
          </View>
        ) : null}

        {isAIMode && relatedQueries.length > 0 ? (
          <View style={styles.aiHintWrap}>
            <Text style={styles.aiHintLabel}>AI Related Queries</Text>
            <Text style={styles.aiHintText}>{relatedQueries.join(' • ')}</Text>
          </View>
        ) : null}

      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['bottom', 'left', 'right']}>
      <View style={styles.customHeader}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </Pressable>

        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.customSearchInput}
            placeholder="Tìm kiếm phim..."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={() => handleSearch(searchQuery)}
          />

          {searchQuery.length > 0 && (
            <Pressable style={styles.clearButton} onPress={() => setSearchQuery('')}>
              <MaterialIcons
                name="close"
                size={16}
                color="rgba(255, 255, 255, 0.6)"
              />
            </Pressable>
          )}

          <Pressable
            style={[styles.aiModeButton, isAIMode && styles.aiModeButtonActive]}
            onPress={toggleAIMode}
          >
            <Ionicons
              name="sparkles"
              size={14}
              color={isAIMode ? '#EAF4FF' : 'rgba(255,255,255,0.76)'}
            />
            {isAIBusy && <View style={styles.aiModeButtonDot} />}
          </Pressable>
        </View>

        <Pressable
          style={styles.filterToggleButton}
          onPress={() => setShowFilters((prev) => !prev)}
        >
          <Ionicons
            name={showFilters ? 'options' : 'options-outline'}
            size={18}
            color="#fff"
          />
          {isAIBusy && (
            <View style={styles.aiBusyDot} />
          )}
        </Pressable>
      </View>

      {isAIMode && searchQuery.trim().length > 1 && aiSuggestions.length > 0 && (
        <View style={styles.suggestionsWrap}>
          <View style={styles.suggestionsHeader}>
            <Text style={styles.suggestionsTitle}>Gợi ý phim từ kho hiện có</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.suggestionsRow}>
              {aiSuggestions.map((item, index: number) => (
                <Pressable
                  key={`${item.query}-${index}`}
                  style={styles.suggestionChip}
                  onPress={() => applySuggestion(item)}
                >
                  <Text style={styles.suggestionChipText}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {showFilters && (
        <View style={styles.filterPanel}>
          <View>
            <Text style={styles.filterSectionLabel}>Thể loại</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterRow}>
                {genres.map((genre) => {
                  const isActive = selectedGenre === genre.slug;
                  return (
                    <Pressable
                      key={genre._id}
                      style={[styles.filterChip, isActive && styles.filterChipActive]}
                      onPress={() =>
                        toggleFilterValue(selectedGenre, genre.slug, setSelectedGenre)
                      }
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          isActive && styles.filterChipTextActive,
                        ]}
                      >
                        {genre.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          <View>
            <Text style={styles.filterSectionLabel}>Quốc gia</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterRow}>
                {countries.map((country) => {
                  const isActive = selectedCountry === country.slug;
                  return (
                    <Pressable
                      key={country._id}
                      style={[styles.filterChip, isActive && styles.filterChipActive]}
                      onPress={() =>
                        toggleFilterValue(
                          selectedCountry,
                          country.slug,
                          setSelectedCountry
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          isActive && styles.filterChipTextActive,
                        ]}
                      >
                        {country.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          <View>
            <Text style={styles.filterSectionLabel}>Năm</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterRow}>
                {years.map((year) => {
                  const isActive = selectedYear === year;
                  return (
                    <Pressable
                      key={year}
                      style={[styles.filterChip, isActive && styles.filterChipActive]}
                      onPress={() =>
                        toggleFilterValue(selectedYear, year, setSelectedYear)
                      }
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          isActive && styles.filterChipTextActive,
                        ]}
                      >
                        {year}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {(selectedGenre || selectedCountry || selectedYear) && (
            <View style={styles.selectedInfoRow}>
              <Text style={styles.selectedInfoText}>
                Đang lọc:{' '}
                {selectedGenre
                  ? genres.find((genre) => genre.slug === selectedGenre)?.name
                  : 'Tất cả thể loại'}
                {' • '}
                {selectedCountry
                  ? countries.find((country) => country.slug === selectedCountry)
                      ?.name
                  : 'Tất cả quốc gia'}
                {' • '}
                {selectedYear || 'Mọi năm'}
              </Text>
              <Pressable style={styles.clearFiltersButton} onPress={clearAllFilters}>
                <Text style={styles.clearFiltersText}>Xóa lọc</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {(isLoading || (isAIMode && (isLoadingRelated1 || isLoadingRelated2))) &&
      hasSearchCriteria ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      ) : movies.length > 0 ? (
        <View style={styles.resultsContainer}>
          <FlatList
            data={movies}
            renderItem={renderMovieCard}
            keyExtractor={(item) => item._id}
            numColumns={3}
            scrollEventThrottle={16}
            ListHeaderComponent={renderListHeader}
            ListFooterComponent={renderFooter}
            scrollIndicatorInsets={{ right: 1 }}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={{
              justifyContent: 'space-between',
            }}
          />
        </View>
      ) : hasSearchCriteria ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsTitle}>Không có kết quả</Text>
          <Text style={[styles.noResultsText, { marginTop: 12 }]}> 
            Hãy thử đổi bộ lọc hoặc từ khóa khác
          </Text>
        </View>
      ) : (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsTitle}>Hãy bắt đầu tìm kiếm</Text>
          <Text style={styles.noResultsText}>
            Nhập tên phim, anime hoặc diễn viên để tìm kiếm
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};
