import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../config';
import {
  CountryMoviesData,
  GetCountryMoviesParams,
  GetCountryMoviesResponse,
} from './countryMovies.types';

export const useGetCountryMovies = (
  countrySlug: string,
  params?: GetCountryMoviesParams
) => {
  return useQuery({
    queryKey: ['countryMovies', countrySlug, params],
    queryFn: async (): Promise<CountryMoviesData> => {
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.sort_field)
        queryParams.append('sort_field', params.sort_field);
      if (params?.sort_type) queryParams.append('sort_type', params.sort_type);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.year) queryParams.append('year', params.year);

      const queryString = queryParams.toString();
      const url = `v1/api/quoc-gia/${countrySlug}${
        queryString ? `?${queryString}` : ''
      }`;

      const response = await apiClient.get<GetCountryMoviesResponse>(url);
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    enabled: !!countrySlug,
  });
};
