import { useQuery } from '@tanstack/react-query';
import { fetchCallCount } from '@/services';

export function useApiCallTracker() {
  return useQuery({
    queryKey: ['callCount'],
    queryFn: fetchCallCount,
    staleTime: 30 * 1000, // refresh every 30s at most
    refetchInterval: 60 * 1000, // poll every minute while app is open
  });
}
