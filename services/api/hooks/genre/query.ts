import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../config';
import { Genre, GenreMoviesParams } from './types';

export const useGetGenres = () => {
  return useQuery({
    queryKey: ['genres'],
    queryFn: async (): Promise<Genre[]> => {
      try {
        const response = await apiClient.get('/the-loai');
        return response.data?.data || response.data;
      } catch (error) {
        throw error;
      }
    },
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });
};

export const useGetGenreMovies = (
  typeListOrParams: string | GenreMoviesParams,
  additionalParams?: Partial<GenreMoviesParams>
) => {
  const params: GenreMoviesParams =
    typeof typeListOrParams === 'string'
      ? { type_list: typeListOrParams, ...additionalParams }
      : typeListOrParams;

  return useQuery({
    queryKey: ['genre-movies', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('page', String(params.page || 1));
      if (params.sort_field)
        queryParams.append('sort_field', params.sort_field);
      if (params.sort_type) queryParams.append('sort_type', params.sort_type);
      if (params.sort_lang) queryParams.append('sort_lang', params.sort_lang);
      if (params.country) queryParams.append('country', params.country);
      if (params.year) queryParams.append('year', String(params.year));
      queryParams.append('limit', String(params.limit || 20));

      const response = await apiClient.get(
        `/v1/api/the-loai/${params.type_list}?${queryParams.toString()}`
      );
      return response.data;
    },
    enabled: !!params.type_list,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
};
