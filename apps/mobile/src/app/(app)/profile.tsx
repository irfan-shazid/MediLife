import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
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

      {Platform.OS === 'android' && (
        <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ gap: 2, flex: 1 }}>
            <ThemedText variant="body">Ring through Do Not Disturb</ThemedText>
            <ThemedText variant="caption" color="textSecondary">
              Optional — lets medicine alarms sound even while DND is on
            </ThemedText>
          </View>
          <Button
            label="Open settings"
            fullWidth={false}
            onPress={() => Linking.sendIntent('android.settings.NOTIFICATION_POLICY_ACCESS_SETTINGS')}
          />
        </Card>
      )}

      <View style={{ marginTop: Spacing.lg }}>
        <Button label="Sign out" variant="ghost" onPress={() => authClient.signOut()} />
      </View>
    </Screen>
  );
}
