import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../config';
import { GetNewMoviesResponse } from './types';

export const useGetNewMovies = (page: number = 1) => {
  return useQuery({
    queryKey: ['movies', page],
    queryFn: async (): Promise<GetNewMoviesResponse> => {
      const response = await apiClient.get<GetNewMoviesResponse>(
        `danh-sach/phim-moi-cap-nhat?page=${page}`
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};
