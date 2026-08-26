import { createApi } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type {
  AdminStats,
  CreateLogInput,
  CreateMedicineInput,
  Medicine,
  MedicineLog,
  UpdateMedicineInput,
} from '@meditime/shared';
import { authClient } from '@/lib/auth-client';
import { cancelMedicineNotifications, scheduleMedicineNotifications } from '@/lib/notifications';
import { showToast } from '@/store/uiSlice';

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export interface RecentUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface ApiRequest {
  url: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
}

interface ApiErrorShape {
  status: number;
  data: unknown;
}

// Better Auth's Expo client stores the session outside the browser cookie jar
// (Expo has none), so every request re-attaches it manually — see
// https://www.better-auth.com/docs/integrations/expo. That's why this is a
// hand-written baseQuery instead of RTK Query's fetchBaseQuery.
const rawBaseQuery: BaseQueryFn<ApiRequest, unknown, ApiErrorShape> = async ({
  url,
  method = 'GET',
  body,
}) => {
  try {
    const cookie = await authClient.getCookie();
    const res = await fetch(`${apiUrl}${url}`, {
      method,
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: res.statusText }));
      return { error: { status: res.status, data } };
    }
    if (res.status === 204) return { data: undefined };
    return { data: await res.json() };
  } catch (err) {
    return { error: { status: 0, data: err instanceof Error ? err.message : 'Network error' } };
  }
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: rawBaseQuery,
  tagTypes: ['Medicine', 'Log', 'AdminStats'],
  endpoints: (builder) => ({
    getMedicines: builder.query<Medicine[], void>({
      query: () => ({ url: '/api/medicines' }),
      providesTags: (result) =>
        result
          ? [...result.map((m) => ({ type: 'Medicine' as const, id: m.id })), { type: 'Medicine' as const, id: 'LIST' }]
          : [{ type: 'Medicine' as const, id: 'LIST' }],
    }),

    getMedicine: builder.query<Medicine, string>({
      query: (id) => ({ url: `/api/medicines/${id}` }),
      providesTags: (_result, _error, id) => [{ type: 'Medicine', id }],
    }),

    createMedicine: builder.mutation<Medicine, CreateMedicineInput>({
      query: (body) => ({ url: '/api/medicines', method: 'POST', body }),
      invalidatesTags: [{ type: 'Medicine', id: 'LIST' }],
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          await scheduleMedicineNotifications(data);
          dispatch(showToast({ message: `${data.name} added` }));
        } catch {
          dispatch(showToast({ message: 'Could not save that medicine', tone: 'error' }));
        }
      },
    }),

    updateMedicine: builder.mutation<Medicine, { id: string; input: UpdateMedicineInput }>({
      query: ({ id, input }) => ({ url: `/api/medicines/${id}`, method: 'PATCH', body: input }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Medicine', id },
        { type: 'Medicine', id: 'LIST' },
      ],
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          await scheduleMedicineNotifications(data);
          dispatch(showToast({ message: 'Changes saved' }));
        } catch {
          dispatch(showToast({ message: 'Could not save changes', tone: 'error' }));
        }
      },
    }),

    deleteMedicine: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/medicines/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Medicine', id: 'LIST' }],
      onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          await cancelMedicineNotifications(id);
          dispatch(showToast({ message: 'Medicine removed' }));
        } catch {
          dispatch(showToast({ message: 'Could not remove that medicine', tone: 'error' }));
        }
      },
    }),

    getLogs: builder.query<MedicineLog[], string | undefined>({
      query: (since) => ({ url: `/api/logs${since ? `?since=${encodeURIComponent(since)}` : ''}` }),
      providesTags: ['Log'],
    }),

    createLog: builder.mutation<MedicineLog, CreateLogInput>({
      query: (body) => ({ url: '/api/logs', method: 'POST', body }),
      invalidatesTags: ['Log'],
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          dispatch(showToast({ message: arg.status === 'taken' ? 'Marked as taken' : 'Marked as skipped' }));
        } catch {
          dispatch(showToast({ message: 'Could not update that dose', tone: 'error' }));
        }
      },
    }),

    getAdminStats: builder.query<{ stats: AdminStats; recentUsers: RecentUser[] }, void>({
      query: () => ({ url: '/api/admin/stats' }),
      providesTags: ['AdminStats'],
    }),
  }),
});

export const {
  useGetMedicinesQuery,
  useGetMedicineQuery,
  useCreateMedicineMutation,
  useUpdateMedicineMutation,
  useDeleteMedicineMutation,
  useGetLogsQuery,
  useCreateLogMutation,
  useGetAdminStatsQuery,
} = api;
