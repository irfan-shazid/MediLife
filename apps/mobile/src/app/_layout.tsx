import { useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Provider } from 'react-redux';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { store } from '@/store';
import { useSession } from '@/lib/auth-client';
import { ensureNotificationSetup } from '@/lib/notifications';
import { ToastHost } from '@/components/toast-host';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { data: session, isPending } = useSession();
  const theme = useTheme();

  const onLayout = useCallback(async () => {
    if (!isPending) {
      await SplashScreen.hideAsync();
    }
  }, [isPending]);

  useEffect(() => {
    onLayout();
  }, [onLayout]);

  useEffect(() => {
    ensureNotificationSetup();
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      // Tapping a reminder just opens the app to Today — the list already
      // shows the actionable dose, so no extra navigation is needed.
    });
    return () => sub.remove();
  }, []);

  if (isPending) {
    return <View style={{ flex: 1, backgroundColor: theme.background }} />;
  }

  const loggedIn = !!session;

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!loggedIn}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={loggedIn}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
      </Stack>
      <ToastHost />
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <RootNavigator />
          </ThemeProvider>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
