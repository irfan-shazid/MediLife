import { useEffect, useState } from 'react';
import { View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSession, authClient } from '@/lib/auth-client';
import { requestNotificationPermission } from '@/lib/notifications';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export default function Profile() {
  const theme = useTheme();
  const { data: session } = useSession();
  const [notifStatus, setNotifStatus] = useState<string>('checking…');

  useEffect(() => {
    Notifications.getPermissionsAsync().then((p) => setNotifStatus(p.status));
  }, []);

  async function onEnableNotifications() {
    const granted = await requestNotificationPermission();
    setNotifStatus(granted ? 'granted' : 'denied');
  }

  return (
    <Screen>
      <ThemedText variant="heading">Profile</ThemedText>

      <Card>
        <ThemedText variant="bodyLarge">{session?.user?.name}</ThemedText>
        <ThemedText variant="caption" color="textSecondary">
          {session?.user?.email}
        </ThemedText>
        {(session?.user as { role?: string } | undefined)?.role === 'admin' && (
          <ThemedText variant="caption" color="primary" style={{ fontWeight: '700' }}>
            Admin
          </ThemedText>
        )}
      </Card>

      <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ gap: 2 }}>
          <ThemedText variant="body">Reminder notifications</ThemedText>
          <ThemedText variant="caption" color="textSecondary">
            Status: {notifStatus}
          </ThemedText>
        </View>
        {notifStatus !== 'granted' && (
          <Button label="Enable" fullWidth={false} onPress={onEnableNotifications} />
        )}
      </Card>

      <View style={{ marginTop: Spacing.lg }}>
        <Button label="Sign out" variant="ghost" onPress={() => authClient.signOut()} />
      </View>
    </Screen>
  );
}
