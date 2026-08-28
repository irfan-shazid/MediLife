import {
  useDeleteSoundMutation,
  useGetSoundsQuery,
  useUploadDefaultSoundMutation,
  useUploadSoundMutation,
} from '@/store/api';

export function useSounds() {
  const { data, isLoading, isFetching, refetch } = useGetSoundsQuery();
  return { data, isLoading, isFetching, refetch };
}

export function useUploadSound() {
  const [trigger, state] = useUploadSoundMutation();
  return {
    mutateAsync: (formData: FormData) => trigger(formData).unwrap(),
    isPending: state.isLoading,
  };
}

export function useUploadDefaultSound() {
  const [trigger, state] = useUploadDefaultSoundMutation();
  return {
    mutateAsync: (formData: FormData) => trigger(formData).unwrap(),
    isPending: state.isLoading,
  };
}

export function useDeleteSound() {
  const [trigger, state] = useDeleteSoundMutation();
  return {
    mutateAsync: (id: string) => trigger(id).unwrap(),
    isPending: state.isLoading,
  };
}
