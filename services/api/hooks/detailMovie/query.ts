import { apiClient } from '@/services/api/config';
import { useQuery } from '@tanstack/react-query';
import { DetailMovieResponse } from './types';

export const getDetailMovie = async (
  slug: string
): Promise<DetailMovieResponse> => {
  const { data } = await apiClient.get(`/phim/${slug}`);
  return data;
};

export const useGetDetailMovie = (slug: string | undefined) => {
  return useQuery({
    queryKey: ['detailMovie', slug],
    queryFn: () => getDetailMovie(slug as string),
    enabled: !!slug,
  });
};
