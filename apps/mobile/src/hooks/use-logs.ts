import type { CreateLogInput } from '@meditime/shared';
import { useCreateLogMutation, useGetLogsQuery } from '@/store/api';

export function useLogs(since?: string) {
  const { data, isLoading, isFetching, refetch } = useGetLogsQuery(since);
  return { data, isLoading, isFetching, refetch };
}

export function useCreateLog() {
  const [trigger, state] = useCreateLogMutation();
  return {
    mutate: (input: CreateLogInput) => trigger(input),
    mutateAsync: (input: CreateLogInput) => trigger(input).unwrap(),
    isPending: state.isLoading,
  };
}
