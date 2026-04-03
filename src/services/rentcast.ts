import axios from 'axios';
import type { RentCastListing, RentCastRentEstimate, RentEstimateParams } from '@/types';

const api = axios.create({ baseURL: '/api' });

export async function fetchListings(zipCode: string): Promise<RentCastListing[]> {
  const { data } = await api.get<{ data: RentCastListing[] }>('/listings', {
    params: { zipCode },
  });
  return data.data;
}

export async function fetchRentEstimate(
  listingId: string,
  params: RentEstimateParams
): Promise<RentCastRentEstimate> {
  const { data } = await api.get<{ data: RentCastRentEstimate }>('/rent-estimate', {
    params: {
      listingId,
      address: params.address,
      propertyType: params.propertyType,
      bedrooms: params.bedrooms,
      bathrooms: params.bathrooms,
      ...(params.squareFootage ? { squareFootage: params.squareFootage } : {}),
    },
  });
  return data.data;
}

export async function fetchCallCount(): Promise<{ count: number; limit: number; remaining: number }> {
  const { data } = await api.get('/call-count');
  return data;
}
