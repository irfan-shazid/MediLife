import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import { adminClient } from 'better-auth/client/plugins';
import * as SecureStore from 'expo-secure-store';

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const authClient = createAuthClient({
  baseURL: apiUrl,
  plugins: [
    expoClient({
      scheme: 'meditime',
      storagePrefix: 'meditime',
      storage: SecureStore,
    }),
    adminClient(),
  ],
});

export const { useSession, signIn, signUp, signOut } = authClient;

export type Role = 'user' | 'admin';

export function isAdmin(user: { role?: string | null } | null | undefined) {
  return user?.role === 'admin';
}
