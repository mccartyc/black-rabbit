import { useQuery } from '@tanstack/react-query';
import { fetchListings } from '@/services';

export function useListings(zipCode: string) {
  return useQuery({
    queryKey: ['listings', zipCode],
    queryFn: () => fetchListings(zipCode),
    enabled: zipCode.length === 5,
    staleTime: 24 * 60 * 60 * 1000, // re-use in-memory result for 24h within session
    retry: 1,
  });
}
