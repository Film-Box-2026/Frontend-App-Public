import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../config';
import {
  GetListMoviesResponse,
  ListMovieItem,
  ListMoviesParams,
} from './types';

export const useGetListMovies = (params?: ListMoviesParams) => {
  return useQuery({
    queryKey: ['listMovies', params],
    queryFn: async (): Promise<ListMovieItem[]> => {
      if (!params?.type_list) {
        throw new Error('type_list is required');
      }

      const queryParams = new URLSearchParams();
      queryParams.append('page', String(params?.page || 1));
      if (params?.sort_field)
        queryParams.append('sort_field', params.sort_field);
      if (params?.sort_type) queryParams.append('sort_type', params.sort_type);
      if (params?.sort_lang) queryParams.append('sort_lang', params.sort_lang);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.country) queryParams.append('country', params.country);
      if (params?.year) queryParams.append('year', String(params.year));
      queryParams.append('limit', String(params?.limit || 20));

      const response = await apiClient.get<GetListMoviesResponse>(
        `/v1/api/danh-sach/${params.type_list}?${queryParams.toString()}`
      );
      return response.data.data.items;
    },
    enabled: !!params?.type_list,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
};
