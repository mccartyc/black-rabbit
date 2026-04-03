import { useQuery } from '@tanstack/react-query';
import { fetchRentEstimate } from '@/services';
import type { RentCastListing } from '@/types';

export function useRentEstimate(listing: RentCastListing | null) {
  return useQuery({
    queryKey: ['rentEstimate', listing?.id],
    queryFn: () =>
      fetchRentEstimate(listing!.id, {
        address: listing!.formattedAddress,
        propertyType: listing!.propertyType,
        bedrooms: listing!.bedrooms,
        bathrooms: listing!.bathrooms,
        squareFootage: listing!.squareFootage,
      }),
    enabled: listing !== null,
    staleTime: 7 * 24 * 60 * 60 * 1000, // re-use in-memory result for 7d within session
    retry: 1,
  });
}
