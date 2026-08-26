import { useGetAdminStatsQuery } from '@/store/api';

export function useAdminStats() {
  const { data, isLoading, isFetching, refetch } = useGetAdminStatsQuery();
  return { data, isLoading, isFetching, refetch };
}
