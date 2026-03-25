import { apiClient } from '@/services/api/config';
import { useQuery } from '@tanstack/react-query';
import { SearchParams, SearchResponse } from './types';

export const useSearchMovies = (
  searchParams: SearchParams,
  options?: { enabled?: boolean }
) => {
  const normalizedKeyword = String(searchParams.keyword ?? '').trim();

  const hasFilters =
    Boolean(searchParams.category) ||
    Boolean(searchParams.country) ||
    Boolean(searchParams.year);

  return useQuery({
    queryKey: ['searchMovies', searchParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (normalizedKeyword.length > 0) {
        params.append('keyword', normalizedKeyword);
      }
      if (searchParams.page)
        params.append('page', searchParams.page.toString());
      if (searchParams.sort_field)
        params.append('sort_field', searchParams.sort_field);
      if (searchParams.sort_type)
        params.append('sort_type', searchParams.sort_type);
      if (searchParams.sort_lang)
        params.append('sort_lang', searchParams.sort_lang);
      if (searchParams.category)
        params.append('category', searchParams.category);
      if (searchParams.country) params.append('country', searchParams.country);
      if (searchParams.year) params.append('year', searchParams.year);
      if (searchParams.limit)
        params.append('limit', searchParams.limit.toString());

      const response = await apiClient.get<SearchResponse>(
        `/v1/api/tim-kiem?${params.toString()}`
      );
      return response.data;
    },
    enabled:
      (normalizedKeyword.length > 0 || hasFilters) &&
      options?.enabled !== false,
    staleTime: 1000 * 60 * 5,
  });
};
