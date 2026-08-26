import type { CreateMedicineInput, UpdateMedicineInput } from '@meditime/shared';
import {
  useCreateMedicineMutation,
  useDeleteMedicineMutation,
  useGetMedicineQuery,
  useGetMedicinesQuery,
  useUpdateMedicineMutation,
} from '@/store/api';

export function useMedicines() {
  const { data, isLoading, isFetching, refetch } = useGetMedicinesQuery();
  return { data, isLoading, isFetching, refetch };
}

export function useMedicine(id: string) {
  const { data, isLoading } = useGetMedicineQuery(id, { skip: !id });
  return { data, isLoading };
}

export function useCreateMedicine() {
  const [trigger, state] = useCreateMedicineMutation();
  return {
    mutate: (input: CreateMedicineInput) => trigger(input),
    mutateAsync: (input: CreateMedicineInput) => trigger(input).unwrap(),
    isPending: state.isLoading,
  };
}

export function useUpdateMedicine(id: string) {
  const [trigger, state] = useUpdateMedicineMutation();
  return {
    mutate: (input: UpdateMedicineInput) => trigger({ id, input }),
    mutateAsync: (input: UpdateMedicineInput) => trigger({ id, input }).unwrap(),
    isPending: state.isLoading,
  };
}

export function useDeleteMedicine() {
  const [trigger, state] = useDeleteMedicineMutation();
  return {
    mutate: (id: string) => trigger(id),
    mutateAsync: (id: string) => trigger(id).unwrap(),
    isPending: state.isLoading,
  };
}
