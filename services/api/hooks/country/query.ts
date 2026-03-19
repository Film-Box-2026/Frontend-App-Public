import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../config';
import { CountryItem } from './types';

export const useGetCountries = () => {
  return useQuery({
    queryKey: ['countries'],
    queryFn: async (): Promise<CountryItem[]> => {
      const response = await apiClient.get<CountryItem[]>('quoc-gia');
      return response.data;
    },
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });
};
