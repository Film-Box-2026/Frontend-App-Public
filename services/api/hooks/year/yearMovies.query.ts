import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../config';
import {
  GetYearMoviesParams,
  GetYearMoviesResponse,
  YearMoviesData,
} from './yearMovies.types';

export const useGetYearMovies = (
  year: string | number,
  params?: GetYearMoviesParams
) => {
  return useQuery({
    queryKey: ['yearMovies', year, params],
    queryFn: async (): Promise<YearMoviesData> => {
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.sort_field)
        queryParams.append('sort_field', params.sort_field);
      if (params?.sort_type) queryParams.append('sort_type', params.sort_type);
      if (params?.sort_lang) queryParams.append('sort_lang', params.sort_lang);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.country) queryParams.append('country', params.country);

      const queryString = queryParams.toString();
      const url = `v1/api/nam/${year}${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get<GetYearMoviesResponse>(url);
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    enabled: !!year,
  });
};
