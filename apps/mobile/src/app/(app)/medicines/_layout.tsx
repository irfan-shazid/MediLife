import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';

export default function MedicinesLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Medicines' }} />
      <Stack.Screen name="new" options={{ title: 'Add medicine', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Edit medicine' }} />
    </Stack>
  );
}
